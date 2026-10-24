export const CLUES = [{x:-8,z:-5},{x:1,z:-6},{x:9,z:1}];
export const CAMP = {x:-11,z:7};
export function newRun(gentle=true){return {x:CAMP.x,z:CAMP.z,elapsed:0,time:gentle?180:100,alert:0,clues:[],status:'playing',gentle,decoys:3,stun:0,decoyCooldown:0,crouching:false};}
export function patrols(t,count=2){return [{x:-2+Math.sin(t*.32)*5,z:1+Math.cos(t*.23)*3},{x:7+Math.sin(t*.24)*3,z:-3+Math.cos(t*.29)*4}].slice(0,count);}
export function stepRun(s,input,dt,obstacles=[]){
 if(s.status!=='playing')return s;
 const d=Math.min(.05,Math.max(0,dt)); let n={...s,clues:[...s.clues],elapsed:s.elapsed+d,time:Math.max(0,s.time-d),stun:Math.max(0,s.stun-d),decoyCooldown:Math.max(0,s.decoyCooldown-d),crouching:!!input.crouch};
 const len=Math.hypot(input.x||0,input.z||0);const speed=input.crouch?2.6:4.7;
 if(len){const x=Math.max(-13,Math.min(13,n.x+input.x/len*speed*d)),z=Math.max(-9,Math.min(9,n.z+input.z/len*speed*d));if(!obstacles.some(o=>Math.hypot(o.x-x,o.z-n.z)<o.r+.35))n.x=x;if(!obstacles.some(o=>Math.hypot(o.x-n.x,o.z-z)<o.r+.35))n.z=z;}
 if(input.decoy&&n.decoys>0&&n.decoyCooldown===0){n.decoys--;n.stun=5;n.decoyCooldown=6;n.alert=Math.max(0,n.alert-30);}
 const danger=n.stun===0&&patrols(n.elapsed,n.gentle?1:2).some(p=>Math.hypot(p.x-n.x,p.z-n.z)<(input.crouch?1.8:3.7));
 n.alert=Math.max(0,Math.min(100,n.alert+(danger?(n.gentle?19:30):-16)*d));
 CLUES.forEach((p,i)=>{if(!n.clues.includes(i)&&Math.hypot(n.x-p.x,n.z-p.z)<1.15)n.clues.push(i);});
 if(n.clues.length===3&&Math.hypot(n.x-CAMP.x,n.z-CAMP.z)<1.5)n.status='won';
 else if(n.alert>=100)n.status='spotted';else if(n.time<=0)n.status='timeout';return n;
}
