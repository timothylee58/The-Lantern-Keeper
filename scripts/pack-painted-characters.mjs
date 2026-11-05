import sharp from 'sharp';
import {mkdir,readdir,writeFile,readFile} from 'node:fs/promises';
const src='assets/painted-character-drafts',out='public/painted';
await mkdir(out,{recursive:true});
const ids=(await readdir(src)).filter(f=>f.endsWith('-painted-source.png')).map(f=>f.replace('-painted-source.png',''));
const original=JSON.parse(await readFile('public/pixel/manifest.json','utf8'));
const report=[];
for(const id of ids){
 const {data,info}=await sharp(`${src}/${id}-painted-source.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const layers=[];
 for(let row=0;row<6;row++)for(let col=0;col<8;col++){
  const x0=Math.round(col*info.width/8),y0=Math.round(row*info.height/6),w=Math.round((col+1)*info.width/8)-x0,h=Math.round((row+1)*info.height/6)-y0;
  const rgba=Buffer.alloc(w*h*4), seen=new Uint8Array(w*h),queue=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=((y+y0)*info.width+x+x0)*4,b=(y*w+x)*4;data.copy(rgba,b,a,a+4);rgba[b+3]=255;}
  const white=i=>{const p=i*4,r=rgba[p],g=rgba[p+1],b=rgba[p+2];return Math.min(r,g,b)>205&&Math.max(r,g,b)-Math.min(r,g,b)<22;};
  const add=i=>{if(!seen[i]&&white(i)){seen[i]=1;queue.push(i);}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  for(let k=0;k<queue.length;k++){const i=queue[k],x=i%w,y=Math.floor(i/w);if(x) add(i-1);if(x<w-1)add(i+1);if(y)add(i-w);if(y<h-1)add(i+w);}
  for(let i=0;i<w*h;i++)if(seen[i] || Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>244)rgba[i*4+3]=0;
  const alpha=Buffer.from(rgba);
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(!alpha[i*4+3])continue;const edge=[i-1,i+1,i-w,i+w].some(j=>!alpha[j*4+3]);if(edge){rgba[i*4+3]=100;for(let c=0;c<3;c++)rgba[i*4+c]=Math.max(0,Math.round((rgba[i*4+c]-70)/0.725));}}
  // Fixed cells preserve the generated vertical motion; a shared scale avoids per-frame size pumping.
  const frame=await sharp(rgba,{raw:{width:w,height:h,channels:4}}).resize(192,256,{fit:'contain'}).png().toBuffer();
  layers.push({input:frame,left:col*192,top:row*256});
 }
 await sharp({create:{width:1536,height:1536,channels:4,background:'#00000000'}}).composite(layers).png({palette:true,colours:128,dither:0}).toFile(`${out}/${id}.png`);
 await sharp(`${out}/${id}.png`).extract({left:0,top:0,width:1536,height:1024}).png({palette:true,colours:128,dither:0}).toFile(`${out}/${id}-walk.png`);
 report.push({id,name:original.characters.find(c=>c.id===id).name,image:id+'.png',frames:48});
}
await writeFile(`${out}/manifest.json`,JSON.stringify({frameWidth:192,frameHeight:256,columns:8,rows:6,directions:original.directions,clips:{Idle:1,Walk:1,Wave:1.5,Celebrate:1.5},characters:report},null,2));
console.log(`Packed ${ids.length} painted character sheets`);
