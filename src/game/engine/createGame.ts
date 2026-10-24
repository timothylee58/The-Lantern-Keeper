import Phaser from 'phaser';
import { CharacterRenderer } from '../../lib/character-renderer';
import { GAME } from '../config';
import { newRun, tick, obstacles, type Run, type Input } from './simulation';
import { lightClues, visibleClue } from '../mechanics/lanternLight';
import type { Neighbor } from '../../data';
export interface GameBridge {
  input: Input;
  paused: boolean;
  motion: boolean;
  onFrame: (s: Run) => void;
  onResult: (s: Run) => void;
  onCue: () => void;
}
export function createExpedition(
  parent: HTMLElement,
  neighbor: Neighbor,
  bridge: GameBridge,
  gentle: boolean,
) {
  const portrait = parent.clientWidth < 600 && neighbor.mechanic !== 'pattern';
  class Expedition extends Phaser.Scene {
    state = newRun(neighbor.mechanic, neighbor.seed, gentle);
    ink!: Phaser.GameObjects.Graphics;
    glow!: Phaser.GameObjects.Graphics;
    lastHud = 0;
    finished = false;
    keys: Record<string, Phaser.Input.Keyboard.Key> = {};
    sprite!: Phaser.GameObjects.Image;
    playerSprite!: Phaser.GameObjects.Container;
    models!: CharacterRenderer;
    modelsReady = false;
    modelDisposed = false;
    lastModel = 0;
    preload() {
      this.load.image('paper-spirits', '/hantu-codex/art/spirit-sprites.webp');
      this.load.image('woodland', '/hantu-codex/art/woodland.webp');
    }
    create() {
      this.cameras.main.setBackgroundColor('#0b1026');
      this.add.image(480, 300, 'woodland').setDisplaySize(960, 600);
      this.ink = this.add.graphics();
      this.glow = this.add.graphics();
      const atlas = this.textures.get('paper-spirits');
      if (atlas.key !== '__MISSING') {
        const source = atlas.getSourceImage() as HTMLImageElement;
        for (let i = 0; i < 6; i++)
          atlas.add(
            i,
            0,
            ((i % 3) * source.width) / 3,
            (Math.floor(i / 3) * source.height) / 2,
            source.width / 3,
            source.height / 2,
          );
        const idx = [
          'pontianak',
          'toyol',
          'hantu-raya',
          'langsuir',
          'pocong',
          'orang-bunian',
        ].indexOf(neighbor.spirit);
        this.sprite = this.add
          .image(this.state.spirit.x, this.state.spirit.y, 'paper-spirits', idx)
          .setDisplaySize(85, 100);
      }
      const body = this.add.graphics();
      body.fillStyle(0xf4e9d2).fillCircle(0, -17, 10);
      body.fillStyle(0x3fb68b).fillTriangle(-14, 20, 14, 20, 0, -10);
      body.lineStyle(3, 0xffd36e).strokeCircle(18, 2, 7);
      body.fillStyle(0xffd36e, 0.8).fillCircle(18, 2, 4);
      this.playerSprite = this.add.container(100, 505, [body]);
      if (portrait) {
        this.cameras.main.setBounds(0, 0, GAME.WIDTH, GAME.HEIGHT);
        this.cameras.main.startFollow(this.playerSprite, true, 0.12, 0.12);
      }
      if (this.input.keyboard) {
        this.keys = this.input.keyboard.addKeys(
          'W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,ONE,TWO,THREE,FOUR',
        ) as Record<string, Phaser.Input.Keyboard.Key>;
        this.input.keyboard.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE']);
      }
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (neighbor.mechanic === 'pattern' && pointer.y > 370 && pointer.y < 500) {
          const i = Math.floor((pointer.x - 240) / 120);
          if (i >= 0 && i < 4) bridge.input.tap = i;
        }
      });
      this.models = new CharacterRenderer(180, 220);
      Promise.all([this.models.load('ari'), this.models.load(neighbor.spirit)])
        .then(() => {
          if (this.modelDisposed) return;
          this.textures.createCanvas('keeper3d', 180, 220);
          this.textures.createCanvas('spirit3d', 180, 220);
          this.playerSprite.removeAll(true);
          this.playerSprite.add(this.add.image(0, -14, 'keeper3d').setDisplaySize(58, 71));
          this.sprite?.setTexture('spirit3d').setDisplaySize(85, 104);
          this.modelsReady = true;
        })
        .catch(() => {
          this.state.feedback = 'The character models could not load. Please retry the expedition.';
        });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.modelDisposed = true;
        this.models.dispose();
        this.input.keyboard?.removeCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE']);
      });
      bridge.onFrame(this.state);
    }
    update(time: number, delta: number) {
      if (this.modelsReady && !bridge.paused && !this.finished) {
        const k = this.keys;
        const input = {
          ...bridge.input,
          x:
            bridge.input.x +
            (k.D?.isDown || k.RIGHT?.isDown ? 1 : 0) -
            (k.A?.isDown || k.LEFT?.isDown ? 1 : 0),
          y:
            bridge.input.y +
            (k.S?.isDown || k.DOWN?.isDown ? 1 : 0) -
            (k.W?.isDown || k.UP?.isDown ? 1 : 0),
          soft: bridge.input.soft || !!k.SHIFT?.isDown,
        };
        ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((name, i) => {
          if (k[name] && Phaser.Input.Keyboard.JustDown(k[name])) input.tap = i;
        });
        const before = this.state;
        this.state = tick(this.state, input, delta / 1000);
        bridge.input.tap = undefined;
        if (
          this.state.clues.length > before.clues.length ||
          this.state.sequenceIndex > before.sequenceIndex
        )
          bridge.onCue();
        if (time - this.lastHud > 80) {
          bridge.onFrame(this.state);
          this.lastHud = time;
        }
        if (this.state.status !== 'playing') {
          this.finished = true;
          bridge.onFrame(this.state);
          bridge.onResult(this.state);
          if (this.state.status === 'won' && bridge.motion) this.cameras.main.shake(220, 0.002);
        }
      }
      const g = this.ink,
        s = this.state;
      g.clear();
      this.glow.clear();
      if (this.modelsReady && time - this.lastModel > 33) {
        const dt = bridge.paused || !bridge.motion ? 0 : (time - this.lastModel) / 1000;
        const walking =
          Math.abs(bridge.input.x) + Math.abs(bridge.input.y) > 0 ||
          ['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT'].some((k) => this.keys[k]?.isDown);
        for (const [id, key, clip] of [
          ['ari', 'keeper3d', this.finished ? 'Celebrate' : walking ? 'Walk' : 'Idle'],
          [
            neighbor.spirit,
            'spirit3d',
            this.finished ? 'Celebrate' : neighbor.mechanic === 'chase' ? 'Walk' : 'Idle',
          ],
        ] as const) {
          const canvas = this.models.render(id, clip, dt);
          const texture = this.textures.get(key) as Phaser.Textures.CanvasTexture;
          if (canvas) {
            texture.context.clearRect(0, 0, 180, 220);
            texture.context.drawImage(canvas, 0, 0);
            texture.refresh();
          }
        }
        this.lastModel = time;
      }
      g.fillStyle(0x0b1026, 0.18).fillRoundedRect(25, 35, 910, 530, 60);
      g.lineStyle(2, 0x3b4762, 0.6).strokeRoundedRect(25, 35, 910, 530, 60);
      if (neighbor.mechanic === 'pattern') {
        this.drawPattern(time);
        this.playerSprite.setVisible(false);
        this.sprite?.setVisible(true).setPosition(480, 175).setDisplaySize(120, 145);
        return;
      }
      g.lineStyle(34, 0x67817b, 0.07);
      g.beginPath();
      g.moveTo(100, 505);
      g.lineTo(220, 360);
      g.lineTo(200, 130);
      g.lineTo(500, 100);
      g.lineTo(800, 180);
      g.lineTo(790, 440);
      g.lineTo(100, 505);
      g.strokePath();
      obstacles(s.seed).forEach((o) => {
        g.fillStyle(0x394057).fillEllipse(o.x, o.y, 78, 65);
        g.lineStyle(2, 0x627064, 0.4).strokeEllipse(o.x - 4, o.y - 4, 70, 55);
      });
      g.lineStyle(3, 0x3fb68b).strokeCircle(GAME.CAMP.x, GAME.CAMP.y, 46);
      g.fillStyle(0x3fb68b, 0.12).fillCircle(GAME.CAMP.x, GAME.CAMP.y, 45);
      if (neighbor.mechanic === 'lantern-light') {
        const waiting = lightClues(s.seed).find((_, i) => !s.clues.includes(i));
        this.sprite?.setVisible(!!waiting);
        if (waiting)
          this.sprite
            ?.setPosition(waiting.x, waiting.y - 45)
            .setAlpha(visibleClue(s.player, waiting, s.soft) ? (s.soft ? 1 : 0.35) : 0.2);
        lightClues(s.seed).forEach((p, i) => {
          if (s.clues.includes(i)) return;
          const visible = visibleClue(s.player, p, s.soft);
          g.fillStyle(0xffd36e, visible ? (s.soft ? 1 : 0.2) : 0.15).fillCircle(
            p.x,
            p.y,
            visible ? 11 : 4,
          );
          if (visible) {
            g.lineStyle(2, 0xffd36e, s.soft ? 0.7 : 0.12).strokeCircle(p.x, p.y, 25);
          }
        });
        for (let r = 7; r > 0; r--)
          this.glow
            .fillStyle(0xffd36e, 0.008)
            .fillCircle(s.player.x, s.player.y, ((GAME.LIGHT_RADIUS * r) / 7) * (s.soft ? 0.8 : 1));
        if (s.hold > 0)
          g.lineStyle(5, 0x3fb68b)
            .arc(
              s.player.x,
              s.player.y,
              32,
              -Math.PI / 2,
              -Math.PI / 2 + (Math.PI * 2 * s.hold) / 0.65,
              false,
            )
            .strokePath();
      } else this.sprite?.setVisible(s.phase < 3).setPosition(s.spirit.x, s.spirit.y - 12);
      this.playerSprite.setVisible(this.modelsReady).setPosition(s.player.x, s.player.y);
      for (let i = 0; i < 20; i++) {
        const y = 65 + ((i * 71) % 470) + (bridge.motion ? Math.sin(time * 0.001 + i) * 8 : 0);
        g.fillStyle(0xffd36e, 0.4).fillCircle(55 + ((i * 137) % 850), y, 1.5);
      }
      if (this.finished && s.status === 'won')
        for (let i = 0; i < 35; i++) {
          const angle = i * 2.4,
            r = 40 + ((time * 0.05 + i * 9) % 180);
          g.fillStyle(i % 2 ? 0xffd36e : 0x3fb68b, 0.8).fillCircle(
            s.player.x + Math.cos(angle) * r,
            s.player.y + Math.sin(angle) * r,
            3,
          );
        }
    }
    drawPattern(time: number) {
      const g = this.ink,
        s = this.state;
      const active =
        s.patternPhase === 'show' && s.patternClock >= 0 ? Math.floor(s.patternClock / 0.65) : -1;
      g.lineStyle(1, 0xffd36e, 0.2).strokeCircle(480, 240, 165);
      for (let i = 0; i < 4; i++) {
        const x = 300 + i * 120,
          on = active < s.pattern.length && active >= 0 && s.pattern[active] === i;
        g.fillStyle([0x3fb68b, 0xffd36e, 0xff9a3c, 0x8b9fda][i], on ? 1 : 0.24).fillRoundedRect(
          x - 46,
          386,
          92,
          92,
          16,
        );
        g.lineStyle(on ? 4 : 1, 0xf4e9d2, on ? 1 : 0.4).strokeRoundedRect(x - 46, 386, 92, 92, 16);
        g.lineStyle(3, 0xf4e9d2);
        if (i === 0) g.strokeCircle(x, 432, 15);
        if (i === 1) g.strokeTriangle(x, 415, x - 17, 448, x + 17, 448);
        if (i === 2) g.strokeRect(x - 13, 419, 26, 26);
        if (i === 3) {
          g.beginPath();
          g.moveTo(x - 18, 432);
          g.lineTo(x + 18, 432);
          g.moveTo(x, 414);
          g.lineTo(x, 450);
          g.strokePath();
        }
      }
      s.pattern.forEach((_, i) =>
        g
          .fillStyle(i < s.sequenceIndex ? 0x3fb68b : 0x59627a)
          .fillCircle(480 + (i - (s.pattern.length - 1) / 2) * 25, 525, 5),
      );
      if (bridge.motion)
        g.lineStyle(1, 0xffd36e, 0.16).strokeCircle(480, 240, 170 + Math.sin(time * 0.001) * 6);
    }
  }
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: portrait ? 480 : GAME.WIDTH,
    height: GAME.HEIGHT,
    backgroundColor: '#0b1026',
    scene: Expedition,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true },
    audio: { noAudio: true },
    input: { keyboard: true, touch: true },
    banner: false,
  });
}
