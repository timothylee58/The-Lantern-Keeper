// Original recipes covering the eight principles described by motion.zajno.com.
export const ease = {soft:[.22,1,.36,1],in:[.42,0,1,1],out:[0,0,.58,1],inOut:[.42,0,.58,1],linear:'linear'};
export const reveal = {hidden:{opacity:0,y:24},visible:{opacity:1,y:0,transition:{duration:.65,ease:ease.soft}}};
export const stagger = {hidden:{},visible:{transition:{staggerChildren:.08,delayChildren:.1}}};
export const fade = {initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.25}};
export const morph = {borderRadius:['35% 65% 60% 40%','60% 40% 35% 65%','35% 65% 60% 40%']};
export const mask = {hidden:{clipPath:'inset(100% 0 0 0)'},visible:{clipPath:'inset(0% 0 0 0)',transition:{duration:.8,ease:ease.soft}}};
export const dimension = {hover:{rotateX:3,rotateY:-3,y:-6,transition:{type:'spring',stiffness:180,damping:20}}};
export const drift = {y:[0,-12,0],rotate:[-1,1,-1],transition:{duration:7,repeat:Infinity,ease:'easeInOut'}};
export const zoom = {scale:[1,1.045,1],transition:{duration:28,repeat:Infinity,ease:'easeInOut'}};
export function parallax(x,y,depth=10){return {x:(x-.5)*depth,y:(y-.5)*depth};}
