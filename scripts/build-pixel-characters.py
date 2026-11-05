"""Original deterministic 8-bit-inspired RPG sprite art. No external artwork."""
from pathlib import Path
import math, json, struct, zlib, zipfile
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'public/pixel';OUT.mkdir(exist_ok=True)
P={'ink':'172038','hair':'282437','hairlight':'49405a','skin':'dba879','skinshade':'ad735c','dark':'b97b56','darkshade':'86523f','mint':'91c7a2','mintshade':'539276','gold':'e2b858','goldshade':'a87736','cream':'f0deb0','creamshade':'c7ae83','jade':'4f9a87','jadeshade':'2f625e','violet':'9c7eac','violetshade':'645575','coral':'d97c69','coralshade':'964f55','terra':'ad704d','terrashade':'754b3d','indigo':'4b517f','indigoshade':'303650','leaf':'738d52','leafshade':'465a3e','white':'fff0ca'}
P={k:tuple(bytes.fromhex(v))+(255,) for k,v in P.items()}
roster=[('ari','Ari','jade','skin','hat','lantern'),('farah','Farah','violet','skin','scarf','book'),('mei-lin','Mei Lin','coral','skin','bun','paper-lantern'),('kavitha','Kavitha','violet','dark','long','bowl'),('daniel','Daniel','cream','dark','short','invitation'),('suri','Suri','indigo','dark','long','spool'),('lina','Lina','jade','skin','long','recorder'),('dina','Dina','terra','dark','long','plate'),('amina','Amina','jade','skin','scarf','textile'),('pontianak','Pontianak','cream','skin','long','lantern'),('toyol','Toyol','terra','mint','tuft','marble'),('hantu-raya','Hantu Raya','leaf','mint','crown','leaf'),('langsuir','Langsuir','jade','skin','long','notes'),('pocong','Pocong','cream','skin','wrap','recipe'),('orang-bunian','Orang Bunian','jade','skin','long','lantern')]
clips={'Idle':2.4,'Walk':1.2,'Wave':1.6,'Celebrate':1.2};dirs=['front','right','back','left']
def png(path,w,h,pixels):
    raw=b''.join(b'\0'+bytes(channel for px in pixels[y*w:(y+1)*w] for channel in px) for y in range(h))
    def chunk(t,d):return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
def frame(c,clip,d,f):
    ident,name,cloth,skin,hair,prop=c; a=[(0,0,0,0)]*(48*64);phase=f*math.tau/12
    floating=ident in ['pontianak','langsuir','orang-bunian'];hop=ident=='pocong'
    lift=round((1-math.cos(phase))*1.5) if floating else round(max(0,math.sin(phase*2))*3) if hop and clip=='Walk' else round(max(0,math.sin(phase))*3) if clip=='Celebrate' else (1 if clip=='Walk' and f%6 in [1,2] else 0)
    if clip=='Idle' and f in [5,6,7]:lift+=1
    def rect(x,y,w,h,color):
        for yy in range(round(y)-lift,round(y+h)-lift):
            for xx in range(round(x),round(x+w)):
                if d==3:xx=47-xx
                assert 1<=xx<47 and 1<=yy<63,(ident,clip,d,f,xx,yy)
                a[yy*48+xx]=P[color]
    def outlined(x,y,w,h,color):rect(x,y,w,h,'ink');rect(x+1,y+1,w-2,h-2,color)
    side=d in [1,3];back=d==2;cx=24; skinshade={'skin':'skinshade','dark':'darkshade','mint':'mintshade'}[skin]
    stride=round(math.sin(phase)*3) if clip=='Walk' and not floating and not hop else 0
    # Long hair/cape creates a distinctive silhouette behind the shoulders.
    if hair=='long':outlined(17 if not side else 18,12,14 if not side else 9,27,'hair');rect(18,17,2,19,'hairlight')
    if ident=='orang-bunian':outlined(13,28,21,24,'indigo')
    # Two alternating legs; lateral silhouettes are deliberately offset.
    for n in range(2):
        x=(18+n*7) if not side else (20+n*4);offset=stride*(1 if n==0 else -1)
        yy=45-(max(0,offset)//2);xx=x+(offset if side else 0)
        outlined(xx,yy,6,12,'indigo');rect(xx+1,yy+2,1,8,'indigoshade');rect(xx-1,yy+11,8,2,'ink');rect(xx+1,yy+11,5,1,'hairlight')
    dress=ident in ['farah','kavitha','dina','amina','pontianak','hantu-raya','langsuir','pocong']
    bw=14 if side else (22 if ident=='hantu-raya' else 18);bx=cx-bw//2
    outlined(bx,26,bw,21,cloth);rect(bx+1,28,3,17,cloth+'shade');rect(bx+4,28,bw-7,2,cloth)
    if dress:
        rect(bx-2,40,bw+4,10,'ink');rect(bx-1,40,bw+2,8,cloth);rect(bx,47,bw,2,'goldshade');rect(bx+1,47,bw-2,1,'gold')
    else:rect(bx+1,44,bw-2,2,'goldshade')
    # Garment details are everyday fictional clothing, not sacred motifs.
    if not back:
        rect(cx-1,27,2,4,'cream')
        if ident in ['daniel','kavitha']: 
            for y in range(32,43,4):rect(cx,y,1,1,'gold')
        if ident=='ari':
            for i in range(14):rect(bx+3+i//2,29+i,2,1,'goldshade')
            outlined(bx-1,38,7,7,'terra')
        if ident=='suri':
            rect(bx+2,27,5,19,'violet')
            for y in range(29,45,3):rect(bx+2,y,5,1,'gold')
        if ident=='pocong':
            for y in [31,39,47]:rect(bx, y,bw,2,'creamshade')
    # Arms stay connected; raised gesture and opposing swing are pixel-authored.
    hands=[]
    for n in range(2):
        x=bx-4 if n==0 else bx+bw-1
        if side:x=21 if n==0 else 25
        swing=(stride if n==0 else -stride)//2
        raised=clip=='Celebrate' or (clip=='Wave' and n==1)
        y=22+round(math.sin(phase*2)) if raised else 29+swing
        outlined(x,y,5,13,cloth);rect(x+1,y+2,2,7,cloth+'shade');outlined(x,y+11,5,5,skin);hands.append((x,y+11))
    # Neck, head, hair/headscarf with an 8-bit silhouette.
    rect(21,23,6,4,'ink');rect(22,23,4,4,skinshade)
    hx=19 if side else 17;hw=11 if side else 14
    outlined(hx,10,hw,15,skin);rect(hx+1,13,2,10,skinshade);rect(hx+3,23,hw-5,2,skinshade)
    if hair in ['scarf','wrap']:
        color=cloth;rect(hx-1,9,hw+2,5,color+'shade');rect(hx,9,hw,3,color);rect(hx-2,13,3,13,color+'shade');rect(hx+hw-1,13,3,13,color);rect(hx-1,25,hw+2,3,color);rect(hx+hw-2,25,1,1,'gold')
    else:
        rect(hx,9,hw,5,'hair');rect(hx+2,8,hw-4,2,'hair');rect(hx+2,10,hw-5,1,'hairlight');rect(hx,13,2,4,'hair')
        if not side:rect(hx+8,12,4,2,'hair')
        if hair=='bun':outlined(hx-3,10,5,6,'hair')
        if hair=='hat':rect(14,10,20,3,'goldshade');rect(18,5,12,5,'cream');rect(20,4,8,2,'cream');rect(18,9,12,2,'goldshade')
    if back:
        rect(hx+1,13,hw-2,10,cloth if hair in ['scarf','wrap'] else 'hair')
        if hair=='long':rect(hx,22,hw,12,'hair')
    else:
        blink=clip=='Idle' and f==9
        for ex in ([hx+hw-3] if side else [hx+4,hx+9]):
            rect(ex,16,2,1 if blink else 2,'ink')
            if not blink:rect(ex,16,1,1,'white')
        if side:rect(hx+hw-1,19,2,2,skin)
        rect(hx+(7 if side else 6),22,3,1,skinshade)
    if ident=='toyol':rect(hx-3,15,3,4,'mint');rect(hx+hw,15,3,4,'mint');rect(22,5,3,5,'jade');rect(24,6,3,3,'jade')
    if ident=='hantu-raya':
        for x in [16,21,26,30]:rect(x,6+(x%3),3,6,'leaf');rect(x,6+(x%3),1,4,'jade')
    if ident=='pocong':rect(21,4,6,5,'cream');rect(18,7,12,2,'creamshade')
    if ident in ['pontianak','langsuir','orang-bunian']:
        rect(hx+hw-2,11,3,3,'gold');rect(hx+hw-1,10,1,5,'cream')
    # Story props follow the hand; omitted behind the body only when occluded.
    x,y=hands[1 if prop in ['lantern','paper-lantern','marble','bowl','recorder'] else 0]
    if prop in ['lantern','paper-lantern']:
        outlined(x-1,y+3,7,3,'goldshade');outlined(x-2,y+5,9,9,'coral' if prop=='paper-lantern' else 'gold');rect(x,y+7,5,5,'cream');rect(x+2,y+8,1,3,'white');rect(x-2,y+13,9,1,'goldshade')
    elif prop in ['book','notes','recipe','invitation','textile']:
        color={'book':'indigo','notes':'cream','recipe':'terra','invitation':'jade','textile':'gold'}[prop]
        outlined(x-2,y+1,9,9,color);rect(x,y+3,5,1,'cream' if color!='cream' else 'ink');rect(x,y+6,5,1,'goldshade')
    elif prop in ['bowl','plate']:outlined(x-3,y+3,11,4,'cream');rect(x-1,y+2,2,2,'gold');rect(x+3,y+2,2,2,'gold')
    elif prop=='spool':outlined(x-1,y,7,7,'cream');rect(x,y+2,5,3,'coral')
    elif prop=='recorder':outlined(x,y,5,8,'ink');rect(x+1,y+1,3,3,'jade');rect(x+2,y+6,1,1,'coral')
    elif prop=='marble':outlined(x,y+3,5,5,'gold');rect(x+1,y+4,2,1,'white')
    return a
records=[]
for c in roster:
    ident,name,*_=c;pixels=[(0,0,0,0)]*(576*1024);allframes=[]
    for ci,clip in enumerate(clips):
        for d in range(4):
            hashes=[]
            for f in range(12):
                a=frame(c,clip,d,f);hashes.append(hash(tuple(a)));allframes.append(a)
                assert any(px[3] for px in a)
                for y in range(64):pixels[((ci*4+d)*64+y)*576+f*48:((ci*4+d)*64+y)*576+(f+1)*48]=a[y*48:(y+1)*48]
            assert len(set(hashes))>=2,(ident,clip,d)
    colors=set(pixels);assert len(colors)<=32 and all(p[3] in [0,255] for p in colors)
    png(OUT/(ident+'.png'),576,1024,pixels)
    png(OUT/(ident+'-walk.png'),576,256,pixels[576*256:576*512])
    records.append({'id':ident,'name':name,'image':ident+'.png','walkImage':ident+'-walk.png','colors':len(colors)-1})
manifest={'frameWidth':48,'frameHeight':64,'columns':12,'directions':dirs,'clips':clips,'anchor':[24,59],'characters':records}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
with zipfile.ZipFile(OUT/'characters-8bit.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(OUT.glob('*.png')):z.write(p,p.name)
    z.write(OUT/'manifest.json','manifest.json');z.write(ROOT/'docs/pixel-characters.md','README.md')
print('Validated 15 original pixel characters, 2,880 animation frames, binary alpha, transparent borders and <=32 colors per character.')
