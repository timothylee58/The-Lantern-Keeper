(() => {
  'use strict';
  const $ = s => document.querySelector(s), modal = $('#modal'), content = $('#modalContent');
  const SAVE = 'lantern-keeper-v1';
  const places = ['The Whispering Grove', 'The Moonlit Crossing', 'The Starlight Summit'];
  const traits = { heart: { name: 'Kind heart', icon: '♡', skill: 'Kindness' }, courage: { name: 'Brave soul', icon: '♧', skill: 'Courage' }, wisdom: { name: 'Quiet mind', icon: '✧', skill: 'Wisdom' } };
  const SOUND_SAVE = 'lantern-keeper-sound-v1';
  let game = null, selected = 'heart', soundOn = true, audio = null, music = null, musicBuffer = null, musicLoading = null, musicGain = null, saveAvailable = true;
  try { soundOn = localStorage.getItem(SOUND_SAVE) !== 'off'; } catch {}
  const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  try { const loaded = JSON.parse(localStorage.getItem(SAVE)); if (loaded && loaded.version === 1 && traits[loaded.trait] && Number.isInteger(loaded.step) && loaded.step >= 0 && loaded.step <= 6 && typeof loaded.name === 'string' && Array.isArray(loaded.journal) && Number.isFinite(loaded.energy) && Number.isFinite(loaded.xp) && Number.isFinite(loaded.lanterns) && Number.isFinite(loaded.tea)) game = loaded; } catch { saveAvailable = false; }
  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 3200); }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify(game)); } catch { saveAvailable = false; toast('Saving is unavailable in this browser. Keep this tab open to continue.'); } updateStart(); }
  function updateStart() { $('#start').innerHTML = `${game ? (game.step === 6 && !game.pending ? 'Your story lives on' : 'Continue your story') : 'Begin your story'} <span>↗</span>`; }
  function show(html) { content.innerHTML = html; if (!modal.open) modal.showModal(); modal.scrollTop = 0; content.querySelector('input, button')?.focus({preventScroll:true}); }
  function close() { modal.close(); }
  $('.close').onclick = close;
  modal.addEventListener('click', e => { if (e.target === modal) { const b = modal.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) close(); } });
  $('#start').onclick = () => game ? renderGame() : creator();
  $('#meet').onclick = () => game ? character() : creator();
  $('#journalNav').onclick = () => journal();
  $('#worldNav').onclick = () => game ? world() : $('#valley').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.querySelectorAll('[data-place]').forEach(el => el.onclick = () => game ? world() : creator());
  function creator() {
    selected = 'heart';
    show(`<div class="creator"><div class="portrait"><div class="portrait-label"><p>THE KEEPER OF SMALL WONDERS</p><h3>Your light is enough.</h3></div></div><form class="dialog-pad" id="creatorForm"><p class="eyebrow">EVERY GREAT STORY STARTS SOMEWHERE</p><h2 id="dialogTitle">Who will you become?</h2><p>Raised among rain trees and lantern-lit evenings, you set out with a little courage and a forest friend.</p><label class="field-label" for="keeperName">YOUR KEEPER’S NAME</label><input id="keeperName" name="name" placeholder="e.g. Ari" value="Ari" maxlength="24" required autocomplete="off"><span class="field-label" id="traitLabel">WHAT GUIDES YOUR WAY?</span><div class="traits" role="group" aria-labelledby="traitLabel">${Object.entries(traits).map(([key,t])=>`<button type="button" class="trait ${key===selected?'selected':''}" data-trait="${key}" aria-pressed="${key===selected}"><b>${t.icon}</b><strong>${t.name}</strong><small>−1 energy · +5 XP</small></button>`).join('')}</div><p style="font-size:11px;margin-top:15px">Your companion: <strong>Biji</strong>, a tiny fox spirit with a very big heart.</p><button type="submit" class="primary full">Step into the valley <span>→</span></button><p class="save-note">${saveAvailable?'Your adventure saves automatically in this browser.':'Saving unavailable — your progress will last in this tab.'}</p></form></div>`);
    document.querySelectorAll('[data-trait]').forEach(button => button.onclick = () => { selected = button.dataset.trait; document.querySelectorAll('[data-trait]').forEach(b => { b.classList.toggle('selected',b === button); b.setAttribute('aria-pressed',String(b===button)); }); });
    $('#creatorForm').onsubmit = event => { event.preventDefault(); const name = $('#keeperName').value.trim(); if (!name) { $('#keeperName').setCustomValidity('Give your keeper a name.'); $('#keeperName').reportValidity(); return; } game = {version:1,name,trait:selected,energy:10,tea:2,xp:0,lanterns:0,step:0,pending:null,journal:[{title:'A new beginning',text:`${name} left the familiar shophouses for Lembah Cahaya, carrying a childhood festival lantern, pandan-ginger tea, and a curious fox named Biji.`}]}; save(); renderGame(); };
    $('#keeperName').oninput = () => $('#keeperName').setCustomValidity('');
  }
  const scenes = [
    { title:'A rustle in the roots', place:0, chapter:'CHAPTER I · THE FOREST THAT LISTENS', text:'Beyond the last kampung house, the path disappears beneath a tangle of old rain tree roots. The air smells of rain and warm earth. A small moss spirit sits beside a broken nest, trying very hard not to cry. Biji nudges your hand. Perhaps the way forward is not a path at all.', quote:'“The wind took my home. Do you think it will bring it back?”', choices:[
      {name:'Gather soft leaves and rebuild the nest',trait:'heart',cost:1,result:'You weave a home from fallen leaves. The moss spirit curls inside, beaming. From its tiny hands, a golden seed settles into your lantern.',log:'A home among the roots'},
      {name:'Climb the rain tree and rescue the old nest',trait:'courage',cost:2,result:'The branches sway, but you keep climbing. You return with the little nest intact. The spirit gives you a golden seed and an enormous, mossy hug.',log:'A brave climb'},
      {name:'Listen to the trees for a sheltered place',trait:'wisdom',cost:1,result:'The oldest rain tree whispers of a hollow protected from the wind. The spirit finds a lasting home, and offers you a seed of warm golden light.',log:'The wisdom of the rain tree'}]},
    {title:'The lantern in the hollow',place:0,chapter:'CHAPTER I · THE FIRST LIGHT',text:'Beyond the rain tree, an ancient stone lantern sleeps beneath a blanket of ivy. Its keeper, a timid deer spirit, stands between you and the hollow. The golden seed warms your palm.',quote:'“I have forgotten how to shine. What if the dark comes back?”',choices:[
      {name:'Promise to share the light, even on dark days',trait:'heart',cost:1,result:'The deer leans against your shoulder. Together you plant the golden seed. Light spills across the forest floor, and every leaf seems to exhale. The Grove Lantern is awake.',log:'The Grove Lantern awakens',lantern:true},
      {name:'Take the first step into the dark hollow',trait:'courage',cost:2,result:'You carry the seed into the darkness. Seeing your steady footsteps, the deer follows. A soft glow unfurls through the roots. The Grove Lantern is awake.',log:'The Grove Lantern awakens',lantern:true},
      {name:'Read the old inscription beneath the ivy',trait:'wisdom',cost:1,result:'“Light is a thing we give away,” the inscription reads. You and the deer understand together. The seed blooms into a thousand sparks. The Grove Lantern is awake.',log:'The Grove Lantern awakens',lantern:true}]},
    {title:'The river of lost things',place:1,chapter:'CHAPTER II · THE MOONLIT CROSSING',text:'Silver water curls around a broken bridge. On the bank, a heron spirit searches the current for a small wooden boat. It carried a letter to someone the heron has not seen in years.',quote:'“Perhaps some words arrive too late.”',choices:[
      {name:'Help the heron write a new letter',trait:'heart',cost:1,result:'You share a quiet moment on the bank, remembering the neighbours who always made room at their table. At last, the right words come. The river slows to listen. A silver reed floats into your hands, carrying the memory of a melody.',log:'Words that found their way'},
      {name:'Wade into the current to rescue the boat',trait:'courage',cost:3,result:'Cold water tugs at your boots. Biji anchors your scarf, and you catch the little boat before it drifts away. The grateful heron gives you a singing silver reed.',log:'The rescued letter'},
      {name:'Follow the eddies to find the lost boat',trait:'wisdom',cost:1,result:'You notice how leaves circle behind a flat stone. There, safe in a quiet eddy, waits the boat. The heron gives you a silver reed that hums with forgotten music.',log:'A patient eye'}]},
    {title:'A song across the water',place:1,chapter:'CHAPTER II · THE SECOND LIGHT',text:'In the middle of the bridge stands a lantern with a cracked glass heart. Beneath it, a river spirit hums half a song, again and again. Your silver reed trembles with the missing notes.',quote:'“I remember the beginning. I cannot remember how it ends.”',choices:[
      {name:'Sing together, letting the spirit find its voice',trait:'heart',cost:1,result:'Your voices meet, uncertain at first, then clear. The glass heart mends with each note. Silver light stretches across the water. The River Lantern is awake.',log:'The River Lantern awakens',lantern:true},
      {name:'Play the reed from the highest bridge stone',trait:'courage',cost:2,result:'You climb above the rushing water and play for the whole valley. The spirit answers with a soaring note. Silver light fills the glass heart. The River Lantern is awake.',log:'The River Lantern awakens',lantern:true},
      {name:'Find the melody in the river’s rhythm',trait:'wisdom',cost:1,result:'Ripple, rain, and reed: three rhythms become one. The spirit remembers its song. Moonlight pours from the mended heart. The River Lantern is awake.',log:'The River Lantern awakens',lantern:true}]},
    {title:'A cloud with heavy pockets',place:2,chapter:'CHAPTER III · ABOVE THE CLOUDS',text:'Past hibiscus and wild ferns, the limestone trail rises into a sea of monsoon clouds. A sleepy cloud spirit blocks the final stairs. Its pockets are full of stones: every worry the valley has ever whispered to the sky.',quote:'“If I put them down, who will carry them?”',choices:[
      {name:'Listen to one worry at a time',trait:'heart',cost:1,result:'You sit beside the cloud, pour a little pandan-ginger tea, and listen. Each worry, spoken aloud, becomes a feather. The spirit rises, lighter at last, and gives you a fallen star.',log:'The weight of being heard'},
      {name:'Carry the heaviest stones up the stairs',trait:'courage',cost:3,result:'You shoulder the stones, and Biji takes the smallest one. The cloud sees it does not have to carry everything alone. It gives you a star from its deepest pocket.',log:'A burden shared'},
      {name:'Build a cairn where the worries can rest',trait:'wisdom',cost:1,result:'Stone by stone, you build a little landmark. The worries become a guide for future travelers. With empty pockets, the cloud smiles and hands you a fallen star.',log:'A place to set things down'}]},
    {title:'The last keeper',place:2,chapter:'CHAPTER III · THE THIRD LIGHT',text:'At the summit, the final lantern is cold. Beside it waits a fox spirit as old as the mountain. Biji bows. Below you, two lights shine in the valley. One small star rests in your hands.',quote:'“A keeper does not banish every shadow. Tell me, little traveler: what does a keeper do?”',choices:[
      {name:'“Makes sure no one sits in the dark alone.”',trait:'heart',cost:1,result:'The old fox closes its eyes and smiles. You place the star inside the lantern. A golden dawn rolls over Lembah Cahaya. Somewhere below, a moss spirit opens its tiny door.',log:'The Starlight Lantern awakens',lantern:true},
      {name:'“Takes another step, even when afraid.”',trait:'courage',cost:2,result:'The fox inclines its head. You lift the star into the lantern. Warm light travels down every mountain path, showing each traveler their next brave step.',log:'The Starlight Lantern awakens',lantern:true},
      {name:'“Remembers that even a little light matters.”',trait:'wisdom',cost:1,result:'The fox’s eyes sparkle. You settle the star into the lantern, and the sky seems to lean closer. Three lights answer one another across the valley. Lembah Cahaya remembers.',log:'The Starlight Lantern awakens',lantern:true}]}
  ];
  function header(){ return `<div class="game-head"><p class="eyebrow">THE LANTERN KEEPER</p><h2 id="dialogTitle">${esc(game.name)}’s journey</h2><div class="stats"><div>♡ ${game.energy}/10 <span>energy</span></div><div>✧ ${game.xp} <span>XP · level ${1+Math.floor(game.xp/30)}</span></div><div>☼ ${game.lanterns}/3 <span>lanterns</span></div><div>${traits[game.trait].icon} <span>${traits[game.trait].name}</span></div></div></div>`; }
  function cost(c){return Math.max(0,c.cost-(game.trait===c.trait?1:0));}
  function renderGame(){
    if (game.pending) return result();
    if (game.step>=scenes.length) return ending();
    const scene=scenes[game.step];
    show(header()+`<div class="game-body"><div class="game-topline"><div class="progress" aria-label="${game.lanterns} of 3 lanterns restored">${[0,1,2].map(i=>`<i class="${i<game.lanterns?'done':''}"></i>`).join('')}</div><button class="text-button" id="mapBtn">Explore the valley ↗</button></div><p class="chapter">${scene.chapter}</p><h3>${scene.title}</h3><p class="story">${scene.text}</p><blockquote class="spirit-quote">${scene.quote}</blockquote><div class="choices">${scene.choices.map((c,i)=>`<button class="choice" data-choice="${i}" ${cost(c)>game.energy?'disabled':''}><span><b>${c.name}</b><small>${traits[c.trait].icon} ${traits[c.trait].skill} · ${cost(c)===0?'No energy cost':cost(c)+' energy'}${game.trait===c.trait?' · Your gift: +5 XP':''}</small></span><span>→</span></button>`).join('')}</div><div class="tools-row"><button id="rest">♧ Rest with Biji (+3 energy)</button><button id="tea" ${game.tea===0?'disabled':''}>♨ Pandan-ginger tea (${game.tea})</button><button id="journalBtn">Journal ↗</button></div></div>`);
    document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.choice)));
    $('#mapBtn').onclick=world; $('#journalBtn').onclick=journal;
    $('#rest').onclick=()=>{if(game.energy===10)return toast('You’re already rested and ready to wander.');game.energy=Math.min(10,game.energy+3);save();renderGame();toast('Biji curls up beside you. Rest restores 3 energy.');};
    $('#tea').onclick=()=>{if(!game.tea)return;if(game.energy===10)return toast('Save your tea for when you need a little warmth.');game.tea--;game.energy=Math.min(10,game.energy+5);save();renderGame();toast('A sip of pandan-ginger tea restores 5 energy.');};
  }
  function choose(index){
    if(game.pending||game.step>=6)return;
    const choice=scenes[game.step].choices[index];if(!choice||cost(choice)>game.energy)return;
    const bonus=game.trait===choice.trait;game.energy-=cost(choice);game.xp+=bonus?20:15;
    if(choice.lantern){game.lanterns++;game.energy=Math.min(10,game.energy+2);}
    game.journal.push({title:choice.log,text:choice.result});game.pending={text:choice.result,xp:bonus?20:15,lantern:!!choice.lantern};game.step++;save();chime();result();
  }
  function result(){const r=game.pending;show(header()+`<div class="game-body"><div class="end-symbol">${r.lantern?'☼':'✧'}</div><p class="chapter center">${r.lantern?'A LITTLE MORE LIGHT IN THE WORLD':'A SMALL ACT. A LASTING DIFFERENCE.'}</p><h3 class="center">${r.lantern?'The valley is waking.':'You made a difference.'}</h3><p class="story">${r.text}</p><div class="result">+${r.xp} experience${r.lantern?' · Lantern restored · +2 energy':''}</div><button class="primary full" id="next">${game.step===6?'Welcome the dawn':game.step%2===0?'Follow the next path':'Continue your journey'} <span>→</span></button></div>`);$('#next').onclick=()=>{game.pending=null;save();renderGame();};}
  function ending(){show(`<div class="dialog-pad center"><div class="ending-art"></div><p class="eyebrow">THREE LANTERNS. ONE EXTRAORDINARY KEEPER.</p><h2 id="dialogTitle">You brought the light home.</h2><p>Lembah Cahaya glows again, ${esc(game.name)}. The kampung lanterns glow, the river has a song, and the mountain has a little less to carry.</p><p>Biji rests against your boots. There will be other paths.<br>For now, this small, beautiful moment is enough.</p><div class="result">☼ 3 lanterns restored &nbsp; · &nbsp; ✧ ${game.xp} XP &nbsp; · &nbsp; ${traits[game.trait].name}</div><button class="primary full" id="endJournal">Open your storybook <span>↗</span></button><button class="text-button" id="restart" style="margin-top:20px">Begin a new adventure</button></div>`);$('#endJournal').onclick=journal;$('#restart').onclick=confirmRestart;}
  function confirmRestart(){show(`<div class="dialog-pad"><p class="eyebrow">A NEW CHAPTER</p><h2 id="dialogTitle">Walk a different path?</h2><p>Starting again replaces the saved keeper and journal in this browser. Try another gift to discover new ways to help the valley.</p><button class="primary full" id="confirmRestart">Create a new keeper</button><button class="text-button" id="cancelRestart" style="margin-top:18px">Keep my story</button></div>`);$('#confirmRestart').onclick=()=>{game=null;try{localStorage.removeItem(SAVE);}catch{}updateStart();creator();};$('#cancelRestart').onclick=renderGame;}
  function journal(){show(`<div class="dialog-pad"><p class="eyebrow">LITTLE THINGS WORTH REMEMBERING</p><h2 id="dialogTitle">${game?esc(game.name)+'’s journal':'Your story is unwritten.'}</h2>${game?game.journal.map((e,i)=>`<div class="journal-entry"><small>PAGE ${String(i+1).padStart(2,'0')} · ${esc(e.title).toUpperCase()}</small><p>${esc(e.text)}</p></div>`).join(''):'<p>Every kind act leaves a mark. Begin your journey to collect the memories you make along the way.</p>'}<button class="primary full" id="backToGame">${game?'Return to your journey':'Create your keeper'} <span>→</span></button></div>`);$('#backToGame').onclick=()=>game?renderGame():creator();}
  function world(){const current=Math.min(2,Math.floor(game.step/2));show(`<div class="dialog-pad"><p class="eyebrow">THE VALLEY OF LEMBAH CAHAYA</p><h2 id="dialogTitle">Follow the little lights.</h2><p>Each awakened lantern opens the path to the next. Your journey is ${game.lanterns===3?'complete':`in ${places[current]}`}.</p><div class="map-list">${places.map((name,i)=>`<div class="map-place"><div><h3>${name}</h3><p>${i<game.lanterns?'Lantern restored · a memory to keep':i===current?'Your current path · a spirit needs your help':'Unexplored · restore the previous lantern'}</p></div><span>${i<game.lanterns?'☼':i===current?'✧':'·'}</span></div>`).join('')}</div><button class="primary full" id="mapReturn">${game.step===6?'Return to your story':'Continue on your path'} <span>→</span></button></div>`);$('#mapReturn').onclick=renderGame;}
  function character(){show(`<div class="creator"><div class="portrait"><div class="portrait-label"><p>KEEPER OF LEMBAH CAHAYA</p><h3>${esc(game.name)}</h3></div></div><div class="dialog-pad"><p class="eyebrow">A LIGHT THAT IS YOURS</p><h2 id="dialogTitle">${esc(game.name)}, the wayfinder</h2><p>A young wayfinder shaped by Malaysian and Singaporean everyday life: a teal baju Melayu-inspired tunic, batik waist wrap, rattan satchel, and well-loved canvas shoes. Your brass lantern recalls the glowing evenings of home.</p><div class="result">${traits[game.trait].icon} ${traits[game.trait].name}<br>Level ${1+Math.floor(game.xp/30)} · ${game.xp} experience<br>Companion: Biji, the fox spirit<br>Satchel: ${game.tea} pandan-ginger teas<br>Lanterns restored: ${game.lanterns} / 3</div><p style="font-size:12px">Your gift reduces matching choices’ energy cost by 1 and earns 5 bonus experience. Every path can restore the valley.</p><button class="primary full" id="charReturn">Return to the valley <span>→</span></button></div></div>`);$('#charReturn').onclick=renderGame;}
  function chime(){if(!soundOn||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(660,audio.currentTime);o.frequency.exponentialRampToValueAtTime(990,audio.currentTime+.5);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+1.5);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+1.5);}
  async function playMusic(){
    if(!musicBuffer){
      if(!musicLoading)musicLoading=fetch('assets/lantern-after-rain.wav').then(r=>{if(!r.ok)throw new Error('Music unavailable');return r.arrayBuffer();}).then(data=>audio.decodeAudioData(data)).then(buffer=>musicBuffer=buffer).finally(()=>musicLoading=null);
      await musicLoading;
    }
    if(!soundOn||document.hidden||music)return;
    music=audio.createBufferSource();music.buffer=musicBuffer;music.loop=true;music.loopStart=0;music.loopEnd=48;
    musicGain=audio.createGain();musicGain.gain.setValueAtTime(0,audio.currentTime);musicGain.gain.linearRampToValueAtTime(.28,audio.currentTime+1.2);
    music.connect(musicGain).connect(audio.destination);music.start();
  }
  function updateSound(){
    const playing=soundOn&&audio?.state==='running'&&music;
    $('#sound').setAttribute('aria-pressed',String(soundOn));
    $('#sound').setAttribute('aria-label',soundOn?'Mute fantasy music':'Play fantasy music');
    $('#sound').title=soundOn&&!playing?'Music starts automatically, or after your first tap.':'Fantasy music';
    $('#sound').innerHTML=`♫ <span>Sound ${soundOn?(playing?'on':'ready'):'off'}</span>`;
  }
  async function startSound(manual=false){
    if(!soundOn||document.hidden)return;
    try{
      if(!audio){audio=new(window.AudioContext||window.webkitAudioContext)();audio.addEventListener('statechange',updateSound);}
      // A blocked resume stays pending until a trusted gesture; try again on that gesture.
      if(audio.state!=='running')await audio.resume();
      if(!soundOn||document.hidden)return;
      await playMusic();
      updateSound();
    }catch{
      if(manual)toast('Music could not load. Tap Sound to try again.');
      updateSound();
    }
  }
  $('#sound').onclick=()=>{
    soundOn=!soundOn;
    try{localStorage.setItem(SOUND_SAVE,soundOn?'on':'off');}catch{}
    if(soundOn)void startSound(true);
    else if(music){const old=music,gain=musicGain;music=null;musicGain=null;gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.setTargetAtTime(0,audio.currentTime,.08);old.stop(audio.currentTime+.4);old.onended=()=>{old.disconnect();gain.disconnect();};}
    updateSound();
  };
  function unlockSound(event){
    if(!event.isTrusted||event.target.closest?.('#sound')||!soundOn)return;
    if(event.type==='keydown'&&(event.repeat||event.ctrlKey||event.metaKey||event.altKey||['Shift','Control','Alt','Meta'].includes(event.key)))return;
    if(!music||audio?.state!=='running')void startSound();
  }
  document.addEventListener('pointerdown',unlockSound);
  document.addEventListener('click',unlockSound);
  document.addEventListener('keydown',unlockSound);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){if(audio)void audio.suspend().catch(()=>{});}
    else void startSound();
  });
  updateSound();
  void startSound();
  updateStart();
})();
