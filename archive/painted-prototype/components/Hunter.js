'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {CAMP,CLUES,newRun,patrols,stepRun} from '../lib/hunter-engine.mjs';

export default function Hunter({spirit,onComplete,motionEnabled}){
 const mount=useRef(null),keys=useRef({}),run=useRef(null),pausedRef=useRef(false),completeRef=useRef(onComplete);
 const [gentle,setGentle]=useState(true),[started,setStarted]=useState(false),[paused,setPaused]=useState(false),[round,setRound]=useState(0),[hud,setHud]=useState(newRun()),[error,setError]=useState(''),[crouch,setCrouch]=useState(false);
 completeRef.current=onComplete;
 useEffect(()=>{setStarted(false);setRound(r=>r+1);},[spirit.id]);
 useEffect(()=>{keys.current.crouch=crouch;},[crouch]);
 useEffect(()=>{pausedRef.current=paused;},[paused]);
 useEffect(()=>{
  const host=mount.current;if(!host)return;let renderer,frame=0,disposed=false;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch{setError('Your browser cannot open the 3D woodland. Try a browser with WebGL enabled. Your codex and map still work.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.setClearColor('#152f2b');host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Three-dimensional woodland. Your keeper is gold; clues are amber; camp is green.');
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#17342e',.021);
  const camera=new THREE.PerspectiveCamera(45,1,.1,100);camera.position.set(0,29,23);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight('#c1f4dc','#172a23',2.1));const moon=new THREE.DirectionalLight('#c8e6fb',2.2);moon.position.set(-8,20,5);scene.add(moon);
  const mat=(c,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:.9,...extra});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,22),mat('#264c3e'));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;scene.add(ground);
  const path=new THREE.Mesh(new THREE.PlaneGeometry(26,2.2),mat('#47725a'));path.rotation.x=-Math.PI/2;path.rotation.z=.19;path.position.z=3;scene.add(path);
  const obstacles=[];const positions=[];for(let i=0;i<45;i++){const x=Math.sin(i*37.1)*13.8,z=Math.cos(i*19.7)*10;if([CAMP,...CLUES].some(p=>Math.hypot(x-p.x,z-p.z)<2.2)||Math.abs(z-3)<1.7||Math.abs(x+10)<1.2)continue;positions.push({x,z});}
  positions.forEach(({x,z},i)=>{const group=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.35,2.6,6),mat('#4f6045'));trunk.position.y=1.3;group.add(trunk);for(let k=0;k<3;k++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1.05,7,5),mat(['#315a46','#416d50','#527959'][i%3]));leaf.scale.set(1.1,.65,1.1);leaf.position.set(Math.sin(k*2)*.5,2.5+k*.35,Math.cos(k*2)*.4);group.add(leaf);}group.position.set(x,0,z);scene.add(group);obstacles.push({x,z,r:.35});});
  const player=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.25,.48,.95,10),mat('#cfaa5e'));body.position.y=.5;player.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.29,12,8),mat('#c79068'));head.position.y=1.18;player.add(head);const hat=new THREE.Mesh(new THREE.ConeGeometry(.43,.35,10),mat('#658f6e'));hat.position.y=1.5;player.add(hat);const light=new THREE.PointLight('#ffcc76',6,5);light.position.set(.5,1.1,0);player.add(light);const orb=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),mat('#ffe0a2',{emissive:'#ffb93f',emissiveIntensity:2}));orb.position.copy(light.position);player.add(orb);scene.add(player);
  const ghosts=[];for(let i=0;i<2;i++){const g=new THREE.Group();const cloth=new THREE.Mesh(new THREE.ConeGeometry(.6,1.35,12),mat(i?'#9ab9b1':'#dbdfce',{transparent:true,opacity:.88}));cloth.position.y=.8;g.add(cloth);const face=new THREE.Mesh(new THREE.SphereGeometry(.35,12,10),mat('#e6ebda'));face.position.y=1.4;g.add(face);for(const x of [-.12,.12]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),mat('#234c40'));eye.position.set(x,1.44,.32);g.add(eye);}scene.add(g);ghosts.push(g);}
  const clueMeshes=CLUES.map((p)=>{const g=new THREE.Group();const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.4),mat('#ffd279',{emissive:'#e7a34c',emissiveIntensity:1}));gem.position.y=.9;g.add(gem);const ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.045,6,30),mat('#f7d68a',{emissive:'#b58c43'}));ring.rotation.x=-Math.PI/2;ring.position.y=.08;g.add(ring);g.position.set(p.x,0,p.z);scene.add(g);return g;});
  const camp=new THREE.Mesh(new THREE.TorusGeometry(1.25,.12,8,40),mat('#acd49f',{emissive:'#69a85c',emissiveIntensity:1.5}));camp.rotation.x=-Math.PI/2;camp.position.set(CAMP.x,.12,CAMP.z);scene.add(camp);
  const fireflies=[];for(let i=0;i<35;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(.035,5,5),new THREE.MeshBasicMaterial({color:'#e4d894'}));f.position.set(Math.sin(i*3.7)*13,1+Math.cos(i)*.8,Math.cos(i*8)*9);scene.add(f);fireflies.push(f);}
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.y=camera.aspect<1?42:29;camera.position.z=camera.aspect<1?31:23;camera.lookAt(0,0,0);camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(host);resize();
  run.current=newRun(gentle);setHud({...run.current});let prev=performance.now(),lastHud=0,reported=false;
  const onKey=e=>{if(!started||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName))return;const allowed=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D','Shift',' '];if(!allowed.includes(e.key))return;e.preventDefault();keys.current[e.key.toLowerCase()]=e.type==='keydown';};
  const onBlur=()=>{keys.current={crouch:keys.current.crouch};if(started){setPaused(true);pausedRef.current=true;}};
  window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKey);window.addEventListener('blur',onBlur);
  const onVisibility=()=>{if(document.hidden)onBlur();};document.addEventListener('visibilitychange',onVisibility);
  function tick(now){if(disposed)return;const dt=Math.min(.05,(now-prev)/1000);prev=now;const k=keys.current;
   if(started&&!pausedRef.current){run.current=stepRun(run.current,{x:(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0),z:(k.s||k.arrowdown?1:0)-(k.w||k.arrowup?1:0),crouch:k.crouch||k.shift,decoy:k[' ']||k.decoy},dt,obstacles);k.decoy=false;}
   const state=run.current,t=state.elapsed;player.position.set(state.x,0,state.z);player.scale.y=state.crouching?.75:1;
   patrols(t,gentle?1:2).forEach((p,i)=>{ghosts[i].visible=true;ghosts[i].position.set(p.x,motionEnabled?Math.sin(now*.002+i)*.15:0,p.z);});if(gentle)ghosts[1].visible=false;
   clueMeshes.forEach((g,i)=>{g.visible=!state.clues.includes(i);if(motionEnabled)g.children[0].rotation.y=now*.001;});
   if(motionEnabled)fireflies.forEach((f,i)=>{f.position.y=1.4+Math.sin(now*.0006+i)*.5;});
   camp.material.emissiveIntensity=state.clues.length===3?2.5:1;
   if(now-lastHud>100){setHud({...state});lastHud=now;}
   if(state.status!=='playing'&&!reported){reported=true;setHud({...state});if(state.status==='won')completeRef.current({spirit:spirit.id,seconds:Math.round(state.elapsed),gentle});}
   renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  }frame=requestAnimationFrame(tick);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onKey);window.removeEventListener('blur',onBlur);document.removeEventListener('visibilitychange',onVisibility);scene.traverse(o=>{o.geometry?.dispose();if(o.material){const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(v=>v.dispose());}});renderer.dispose();renderer.domElement.remove();};
 },[started,round,gentle,spirit.id,motionEnabled]);
 const begin=()=>{setPaused(false);pausedRef.current=false;keys.current={};setCrouch(false);setStarted(true);setRound(r=>r+1);setTimeout(()=>mount.current?.focus(),0);};
 const arrow=(key,label)=> <button aria-label={label} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current[key]=true;}} onPointerUp={()=>keys.current[key]=false} onPointerCancel={()=>keys.current[key]=false} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();keys.current[key]=true;}}} onKeyUp={()=>keys.current[key]=false}>{label==='Move up'?'↑':label==='Move down'?'↓':label==='Move left'?'←':'→'}</button>;
 return <section className="hunter-game"><div className="game-toolbar"><span>FIELD EXPEDITION <b>{spirit.name}</b></span><button onClick={()=>{setPaused(!paused);mount.current?.focus();}} disabled={!started||hud.status!=='playing'}>{paused?'Resume':'Pause'}</button></div><div className="game-stage"><div className="three-host" ref={mount} tabIndex={0} role="application" aria-label="Hantu Hunter. Move with WASD or arrows, hold Shift to tiptoe, press Space for a firefly distraction."/>
 <div className="game-hud"><span>✧ {hud.clues.length}/3 clues</span><span>◷ {Math.ceil(hud.time)}s</span><span>◉ Notice {Math.round(hud.alert)}%</span></div><div className="notice-meter"><i style={{width:`${hud.alert}%`}}/></div>
 {(!started||error)&&<div className="game-overlay"><span className="eyebrow">A LITTLE STEALTH. A LOT OF WONDER.</span><h2>Hantu Hunter</h2><p>{error||spirit.brief}</p>{!error&&<><label className="gentle-choice"><input type="checkbox" checked={gentle} onChange={e=>setGentle(e.target.checked)}/> Gentle expedition · extra time, one curious spirit</label><p className="game-help">Collect 3 amber clues. Return to the green camp ring.<br/>WASD / arrows to move · Shift to tiptoe · Space to distract</p><button className="gold-button" onClick={begin}>Enter the woodland <span>↗</span></button></>}</div>}
 {started&&paused&&hud.status==='playing'&&<div className="game-overlay"><h2>A quiet moment.</h2><p>Your expedition is paused.</p><button className="gold-button" onClick={()=>{setPaused(false);mount.current?.focus();}}>Keep exploring →</button></div>}
 {started&&hud.status!=='playing'&&<div className="game-overlay"><span className="eyebrow">{hud.status==='won'?'FIELD RECORD COLLECTED':'EVERY EXPLORER GETS ANOTHER TRY'}</span><h2>{hud.status==='won'?'A story to take home.':hud.status==='spotted'?'They found you!':'Time for a tea break.'}</h2><p>{hud.status==='won'?`${spirit.name} is now in your collection. Your expedition took ${Math.round(hud.elapsed)} seconds.`:'The spirits give you a friendly wave. Try tiptoeing nearby, or use fireflies to distract them. Your collection is safe.'}</p><button className="gold-button" onClick={begin}>Explore again ↗</button></div>}
 </div><div className="game-controls"><div className="dpad"><span/>{arrow('arrowup','Move up')}<span/>{arrow('arrowleft','Move left')}{arrow('arrowdown','Move down')}{arrow('arrowright','Move right')}</div><div className="action-controls"><button className={crouch?'selected':''} aria-pressed={crouch} onClick={()=>{setCrouch(!crouch);mount.current?.focus();}}>♧ {crouch?'Tiptoeing':'Tiptoe'}</button><button onClick={()=>{keys.current.decoy=true;mount.current?.focus();}} disabled={!started||paused||hud.status!=='playing'||hud.decoys===0||hud.decoyCooldown>0}>✦ Fireflies · {hud.decoys}</button></div><p>You’re collecting stories.<br/>The spirits are playing hide-and-seek.</p></div></section>;
}
