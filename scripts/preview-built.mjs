import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('out');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.wav':'audio/wav','.ttf':'font/ttf','.glb':'model/gltf-binary','.zip':'application/zip'};
http.createServer(async(req,res)=>{
 try{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root)throw new Error('Invalid path');
  let info=await stat(file);if(info.isDirectory()){file=path.join(file,'index.html');info=await stat(file);}
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache','Accept-Ranges':'bytes'};
  let start=0,end=info.size-1,status=200;
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   start=match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]));
   end=match[1]&&match[2]?Math.min(Number(match[2]),info.size-1):info.size-1;
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;headers['Content-Length']=end-start+1;
  }
  res.writeHead(status,headers);
  if(req.method==='HEAD')res.end();else{const stream=createReadStream(file,{start,end});res.on('close',()=>stream.destroy());stream.pipe(res);}
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Built preview: http://127.0.0.1:4173/'));
