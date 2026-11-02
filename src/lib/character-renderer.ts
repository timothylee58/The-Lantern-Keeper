import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export type CharacterClip = 'Idle' | 'Walk' | 'Wave' | 'Celebrate';
interface Actor {
  wrapper: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  active?: string;
}
export class CharacterRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;
  readonly actors = new Map<string, Actor>();
  disposed = false;
  constructor(width = 240, height = 300, transparent = true) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: transparent,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x0b1026, transparent ? 0 : 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    const aspect = width / height;
    this.camera = new THREE.OrthographicCamera(
      -1.45 * aspect,
      1.45 * aspect,
      1.45,
      -1.45,
      0.01,
      50,
    );
    this.camera.position.set(3, 2.3, 6);
    this.camera.lookAt(0, 1, 0);
    this.scene.add(new THREE.HemisphereLight(0xfff1d1, 0x677396, 1.5));
    const key = new THREE.DirectionalLight(0xffe5bc, 2.5);
    key.position.set(3, 6, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x9bd5d2, 1.7);
    rim.position.set(-4, 3, -2);
    this.scene.add(rim);
  }
  async load(id: string) {
    if (this.actors.has(id)) return;
    const gltf = await new GLTFLoader().loadAsync(`/hantu-codex/models/${id}.glb`);
    if (this.disposed) {
      this.disposeObject(gltf.scene);
      return;
    }
    const bounds = new THREE.Box3().setFromObject(gltf.scene),
      size = bounds.getSize(new THREE.Vector3()),
      center = bounds.getCenter(new THREE.Vector3());
    const wrapper = new THREE.Group(),
      scale = 2.05 / Math.max(0.1, size.y);
    gltf.scene.scale.setScalar(scale);
    gltf.scene.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    wrapper.add(gltf.scene);
    wrapper.visible = false;
    this.scene.add(wrapper);
    const mixer = new THREE.AnimationMixer(gltf.scene),
      actions = new Map(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
    this.actors.set(id, { wrapper, mixer, actions });
  }
  render(id: string, clip: CharacterClip = 'Idle', dt = 0, turn = 0) {
    const actor = this.actors.get(id);
    if (!actor) return null;
    for (const a of this.actors.values()) a.wrapper.visible = a === actor;
    actor.wrapper.rotation.y = turn;
    if (actor.active !== clip) {
      if (dt === 0) actor.mixer.stopAllAction();
      else if (actor.active) actor.actions.get(actor.active)?.fadeOut(0.3);
      const action = actor.actions.get(clip)?.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
      if (dt > 0) action?.fadeIn(0.3);
      else action?.setEffectiveWeight(1);
      action?.play();
      actor.active = clip;
    }
    actor.mixer.update(Math.min(0.1, Math.max(0, dt)));
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement;
  }
  private disposeObject(object: THREE.Object3D) {
    object.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const materials = Array.isArray(o.material) ? o.material : [o.material];
        materials.forEach((m) => {
          const mat = m as THREE.MeshStandardMaterial;
          mat.map?.dispose();
          m.dispose();
        });
      }
    });
  }
  dispose() {
    this.disposed = true;
    for (const a of this.actors.values()) {
      a.mixer.stopAllAction();
      this.disposeObject(a.wrapper);
    }
    this.actors.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
