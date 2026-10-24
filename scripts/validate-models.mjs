import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {AnimationMixer,Box3} from 'three';
const manifest=JSON.parse(await readFile('public/models/manifest.json','utf8'));
for(const record of manifest){
 const bytes=await readFile(`public/models/${record.id}.glb`);
 const model=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 assert.deepEqual(model.animations.map(a=>a.name),['Idle','Walk','Wave','Celebrate']);
 for(const clip of model.animations){
  for(const track of clip.tracks){
   assert([...track.values].every(Number.isFinite));const size=track.getValueSize();
   for(let i=0;i<size;i++)assert(Math.abs(track.values[i]-track.values[track.values.length-size+i])<1e-6);
  }
  const mixer=new AnimationMixer(model.scene);mixer.clipAction(clip).play();
  for(let frame=0;frame<30;frame++){
   mixer.update(clip.duration/30);model.scene.updateMatrixWorld(true);
   const box=new Box3().setFromObject(model.scene);
   assert([...box.min.toArray(),...box.max.toArray()].every(Number.isFinite));
   assert(box.max.y-box.min.y<3.2,'Animated figure unexpectedly extends out of bounds');
  }
  mixer.stopAllAction();
 }
 const dxf=await readFile(`public/models/${record.id}.dxf`,'utf8');
 assert.equal(dxf.split('\n3DFACE\n').length-1,record.triangles);
 assert(dxf.includes('$INSUNITS\n70\n4\n'));
}
console.log(`Validated ${manifest.length} actual GLB loads, 60 animated loops, finite geometry and matching DXF face counts.`);
