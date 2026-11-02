from pathlib import Path
import tarfile, io, uuid, json, zipfile
root=Path(__file__).resolve().parents[1]
files={f'Assets/LanternKeeper/{p.relative_to(root/"unity").as_posix()}':p for p in (root/'unity').rglob('*') if p.is_file()}
for directory, pattern in [('models','*.glb'),('sprites','*.png')]:
    for p in (root/'public'/directory).glob(pattern):files[f'Assets/LanternKeeper/{directory}/{p.name}']=p
    files[f'Assets/LanternKeeper/{directory}/manifest.json']=root/'public'/directory/'manifest.json'
assert sum(p.suffix=='.glb' for p in files.values())==15
assert sum(p.suffix=='.png' for p in files.values())==15
with tarfile.open(root/'public/models/lantern-keeper-unity.unitypackage','w:gz') as tar:
    for target,p in sorted(files.items()):
        guid=uuid.uuid5(uuid.NAMESPACE_URL,'lantern-keeper/'+target).hex
        for name,data in [('asset',p.read_bytes()),('asset.meta',f'fileFormatVersion: 2\nguid: {guid}\n'.encode()),('pathname',target.encode())]:
            info=tarfile.TarInfo(guid+'/'+name);info.size=len(data);info.mode=0o644;tar.addfile(info,io.BytesIO(data))
with zipfile.ZipFile(root/'public/sprites/walking-sprites.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted((root/'public/sprites').glob('*.png')):z.write(p,p.name)
    z.write(root/'public/sprites/manifest.json','manifest.json')
    z.write(root/'docs/walking-sprites.md','README.md')
print('Packaged 15 GLBs and 15 sprite sheets for Unity; all-sprite ZIP ready. Unity Editor import untested.')
