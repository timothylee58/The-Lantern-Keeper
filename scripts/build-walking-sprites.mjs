import http from 'node:http';
import path from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const root=process.cwd(), output=path.join(root,'public/sprites');
await mkdir(output,{recursive:true});
const html=`<!doctype html><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script><script type="module">
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
window.bake=async(id)=>{
 const gltf=await new GLTFLoader().loadAsync('/public/models/'+id+'.glb');
 const scene=new T.Scene();scene.add(gltf.scene);
 scene.add(new T.HemisphereLight(0xfff1d1,0x677396,1.5));
 const key=new T.DirectionalLight(0xffe5bc,2.5);key.position.set(3,6,5);scene.add(key);
 const rim=new T.DirectionalLight(0x9bd5d2,1.7);rim.position.set(-4,3,-2);scene.add(rim);
 const clip=gltf.animations.find(c=>c.name==='Walk'), mixer=new T.AnimationMixer(gltf.scene);mixer.clipAction(clip).play();
 const bounds=new T.Box3();
 for(let f=0;f<48;f++){mixer.setTime(f*clip.duration/48);gltf.scene.updateMatrixWorld(true);bounds.union(new T.Box3().setFromObject(gltf.scene));}
 const height=bounds.max.y-bounds.min.y, radius=Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x),Math.abs(bounds.min.z),Math.abs(bounds.max.z));
 const span=Math.max(height*1.18, radius*2*256/192*1.15), cy=(bounds.max.y+bounds.min.y)/2;
 const camera=new T.OrthographicCamera(-span*192/256/2,span*192/256/2,span/2,-span/2,.01,20);
 camera.position.set(0,cy,6);camera.lookAt(0,cy,0);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(192,256);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const sheet=document.createElement('canvas');sheet.width=192*12;sheet.height=256*4;const ctx=sheet.getContext('2d');const hashes=[];
 for(let row=0;row<4;row++)for(let f=0;f<12;f++){
  gltf.scene.rotation.y=[0,Math.PI/2,Math.PI,-Math.PI/2][row];mixer.setTime(f*clip.duration/12);renderer.render(scene,camera);ctx.drawImage(renderer.domElement,f*192,row*256);
 }
 const pixels=ctx.getImageData(0,0,sheet.width,sheet.height).data;
 for(let row=0;row<4;row++)for(let f=0;f<12;f++){
  let opaque=0,hash=2166136261;
  for(let y=0;y<256;y++)for(let x=0;x<192;x++){let i=((row*256+y)*sheet.width+f*192+x)*4,a=pixels[i+3];if(a)opaque++;if((x<2||x>189||y<2||y>253)&&a)throw Error(id+' clipped frame '+row+':'+f);for(let c=0;c<4;c++)hash=Math.imul(hash^pixels[i+c],16777619);}
  if(opaque<100)throw Error(id+' empty frame');hashes.push(hash>>>0);
 }
 for(let row=0;row<4;row++)if(new Set(hashes.slice(row*12,row*12+12)).size<6)throw Error(id+' insufficient movement');
 const png=sheet.toDataURL('image/png').split(',')[1];renderer.dispose();gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}});
 return {png,duration:clip.duration,hashes};
};
</script>`;
const server=http.createServer(async(req,res)=>{try{if(req.url==='/'){res.setHeader('Content-Type','text/html');return res.end(html);}const file=path.resolve(root,'.'+decodeURIComponent(req.url));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader']});const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof window.bake==='function');
 const models=JSON.parse(await readFile('public/models/manifest.json','utf8')), characters=[];
 for(const model of models){const result=await page.evaluate(id=>window.bake(id),model.id);await writeFile(path.join(output,model.id+'-walk.png'),Buffer.from(result.png,'base64'));characters.push({id:model.id,name:model.name,image:model.id+'-walk.png',duration:result.duration,frameRate:12/result.duration,frames:48});console.log(model.id+': 48 transparent, unclipped movement frames');}
 await writeFile(path.join(output,'manifest.json'),JSON.stringify({frameWidth:192,frameHeight:256,columns:12,rows:['front','right','back','left'],origin:[.5,1],characters},null,2)+'\n');
}finally{await browser?.close();server.close();}
