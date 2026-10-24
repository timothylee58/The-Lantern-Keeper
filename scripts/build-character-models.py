#!/usr/bin/env python3
"""Original parametric puppet models. Python standard library; no source assets."""
from pathlib import Path
import json, math, struct, zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/models'
PALETTE = {
    'indigo': '#292c55', 'deep': '#171d38', 'gold': '#d6ac59', 'cream': '#f2dfb8',
    'jade': '#5c9b87', 'mint': '#9acdb2', 'coral': '#cd7868', 'violet': '#8d799f',
    'terra': '#ac6d4f', 'skin': '#c48e66', 'warm': '#d9aa81', 'darkskin': '#a97551',
    'hair': '#292a37', 'eye': '#202339', 'white': '#fff2d3', 'rose': '#df9d86',
    'leaf': '#75916e', 'bark': '#68745c', 'glow': '#f6d488',
}

def quat(axis, angle):
    s = math.sin(angle/2)
    return [axis[0]*s, axis[1]*s, axis[2]*s, math.cos(angle/2)]

def rotate(v, q):
    x,y,z,w=q; vx,vy,vz=v
    tx=2*(y*vz-z*vy); ty=2*(z*vx-x*vz); tz=2*(x*vy-y*vx)
    return [vx+w*tx+y*tz-z*ty,vy+w*ty+z*tx-x*tz,vz+w*tz+x*ty-y*tx]

def qmul(a,b):
    x,y,z,w=a; X,Y,Z,W=b
    return [w*X+x*W+y*Z-z*Y,w*Y-x*Z+y*W+z*X,w*Z+x*Y-y*X+z*W,w*W-x*X-y*Y-z*Z]

def sphere(rx,ry,rz, rings=10, sides=16):
    p=[]; n=[]; faces=[]
    for j in range(rings+1):
        v=math.pi*j/rings
        for i in range(sides+1):
            u=2*math.pi*i/sides
            a=[math.sin(v)*math.cos(u),math.cos(v),math.sin(v)*math.sin(u)]
            p.append([a[0]*rx,a[1]*ry,a[2]*rz])
            nn=[a[0]/rx,a[1]/ry,a[2]/rz]; length=math.sqrt(sum(t*t for t in nn)); n.append([t/length for t in nn])
    for j in range(rings):
        for i in range(sides):
            a=j*(sides+1)+i; b=a+sides+1
            if j>0: faces.append([a,a+1,b])
            if j<rings-1: faces.append([a+1,b+1,b])
    return p,n,faces

def flatmesh(vertices, faces):
    p=[]; n=[]; idx=[]
    for face in faces:
        for k in range(1,len(face)-1):
            tri=[vertices[face[0]],vertices[face[k]],vertices[face[k+1]]]
            a=[tri[1][i]-tri[0][i] for i in range(3)]; b=[tri[2][i]-tri[0][i] for i in range(3)]
            nn=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
            length=math.sqrt(sum(t*t for t in nn)); assert length>1e-10
            nn=[t/length for t in nn]; offset=len(p); p.extend(tri); n.extend([nn]*3); idx.append([offset,offset+1,offset+2])
    return p,n,idx

def box(x,y,z):
    v=[[a*x/2,b*y/2,c*z/2] for a,b,c in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    return flatmesh(v,[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]])

def cylinder(rt,rb,h,depth=1,sides=18):
    v=[]
    for radius,y in [(rb,-h/2),(rt,h/2)]:
        for i in range(sides):
            a=2*math.pi*i/sides; v.append([math.cos(a)*radius,y,math.sin(a)*radius*depth])
    faces=[]
    for i in range(sides):
        j=(i+1)%sides; faces.append([i,j,j+sides,i+sides])
    faces.extend([list(range(sides-1,-1,-1)),list(range(sides,sides*2))])
    # Side order above faces inward for Y-up cylinders; reverse the full winding.
    return flatmesh(v,[f[::-1] for f in faces])

def leaf(width,height,depth=.035):
    points=[(0,-height/2),(-width*.5,-height*.13),(-width*.38,height*.18),(0,height/2),(width*.38,height*.18),(width*.5,-height*.13)]
    v=[[x,y,-depth/2] for x,y in points]+[[x,y,depth/2] for x,y in points]
    return flatmesh(v,[list(range(5,-1,-1)),list(range(6,12))]+[[i,(i+1)%6,(i+1)%6+6,i+6] for i in range(6)])

class Model:
    def __init__(self, ident, name):
        self.id=ident; self.name=name; self.nodes=[]; self.parts=[]; self.bin=bytearray(); self.views=[]; self.accessors=[]; self.meshes=[]
        self.materials=[]; self.colors={}; self.eyes=[]; self.root=self.node('PuppetRoot'); self.joints={}
    def node(self,name,parent=None,pos=(0,0,0),rotation=None):
        node={'name':name,'translation':list(pos)}
        if rotation: node['rotation']=rotation
        idx=len(self.nodes); self.nodes.append(node)
        if parent is not None: self.nodes[parent].setdefault('children',[]).append(idx)
        return idx
    def accessor(self,values,kind,ctype=5126,target=None,bounds=False):
        while len(self.bin)%4:self.bin.append(0)
        flat=[v for row in values for v in row] if isinstance(values[0],(list,tuple)) else values
        raw=struct.pack('<'+('f' if ctype==5126 else 'I')*len(flat),*flat)
        view={'buffer':0,'byteOffset':len(self.bin),'byteLength':len(raw)}
        if target:view['target']=target
        vi=len(self.views); self.views.append(view); self.bin.extend(raw)
        acc={'bufferView':vi,'componentType':ctype,'count':len(values),'type':kind}
        if bounds:
            rows=values if isinstance(values[0],(list,tuple)) else [[v] for v in values]
            acc['min']=[min(row[k] for row in rows) for k in range(len(rows[0]))]
            acc['max']=[max(row[k] for row in rows) for k in range(len(rows[0]))]
        ai=len(self.accessors); self.accessors.append(acc); return ai
    def material(self,color):
        if color in self.colors:return self.colors[color]
        hexcolor=PALETTE.get(color,color).lstrip('#'); srgb=[int(hexcolor[i:i+2],16)/255 for i in [0,2,4]]
        # glTF material factors are linear, whereas the authored palette is sRGB.
        rgb=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in srgb]
        mat={'name':color,'pbrMetallicRoughness':{'baseColorFactor':rgb+[1],'metallicFactor':0,'roughnessFactor':.86},'doubleSided':True}
        if color=='glow':mat['emissiveFactor']=[c*.35 for c in rgb]
        self.colors[color]=len(self.materials); self.materials.append(mat); return self.colors[color]
    def part(self,name,geometry,color,parent=None,pos=(0,0,0),rotation=None):
        p,n,faces=geometry
        assert p and faces and all(abs(math.sqrt(sum(x*x for x in nn))-1)<1e-5 for nn in n)
        for a,b,c in faces:
            u=[p[b][i]-p[a][i] for i in range(3)]; v=[p[c][i]-p[a][i] for i in range(3)]
            cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
            assert sum(t*t for t in cross)>1e-18, (name,a,b,c)
        vertex=self.accessor(p,'VEC3',target=34962,bounds=True); normal=self.accessor(n,'VEC3',target=34962)
        indices=self.accessor([i for f in faces for i in f],'SCALAR',5125,34963)
        self.meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':vertex,'NORMAL':normal},'indices':indices,'material':self.material(color),'mode':4}]})
        ni=self.node(name,self.root if parent is None else parent,pos,rotation); self.nodes[ni]['mesh']=len(self.meshes)-1
        self.parts.append((ni,p,faces,color)); return ni
    def ball(self,name,size,color,parent=None,pos=(0,0,0),detail=False):
        return self.part(name,sphere(*size,6 if detail else 10,10 if detail else 16),color,parent,pos)
    def slab(self,name,size,color,parent=None,pos=(0,0,0),rotation=None):
        return self.part(name,box(*size),color,parent,pos,rotation)
    def smile(self,parent,y=0,z=.246,width=.105):
        for i in range(9):
            x=-width+2*width*i/8; yy=y-.075+.055*(x/width)**2
            self.ball('Smile_%02d'%i,(.015,.011,.009),'eye',parent,(x,yy,z),True)
    def face(self,parent,skin='warm',spirit=False):
        self.ball('Face',(.295,.325,.245),skin,parent)
        for side in [-1,1]:
            self.ball('Ear',(.065,.085,.055),skin,parent,(side*.28,-.005,0),True)
            eye=self.node('Blink_eye',parent,(side*.101,.045,.231)); self.eyes.append(eye)
            self.ball('Eye',(.033,.044,.02),'eye',eye)
            self.ball('Eye_glint',(.009,.012,.008),'white',eye,(-.008,.012,.018),True)
            self.ball('Cheek',(.05,.023,.012),'rose',parent,(side*.169,-.045,.218),True)
        self.ball('Nose',(.034,.04,.025),skin,parent,(0,-.012,.249),True)
        self.smile(parent)
    def lantern(self,parent,pos=(0,-.76,0),color='gold'):
        group=self.node('Lantern',parent,pos)
        self.part('Lantern_light',cylinder(.115,.115,.25,.85,8),'glow',group)
        for y in [-.14,.14]:self.part('Lantern_rim',cylinder(.14,.14,.04,.85,8),color,group,(0,y,0))
        for x in [-.1,.1]:self.slab('Lantern_strut',(.02,.28,.02),color,group,(x,0,.085))
        self.slab('Lantern_handle',(.22,.025,.025),color,group,(0,.26,0))
        for x in [-.1,.1]:self.slab('Lantern_handle_side',(.025,.12,.025),color,group,(x,.21,0))
        return group
    def humanoid(self,shirt='jade',skin='warm',dress=False,headscarf=False,hair='short'):
        for side,label in [(-1,'Left'),(1,'Right')]:
            leg=self.node(label+'Leg',self.root,(side*.17,.85,0));self.joints[label+'Leg']=leg
            self.ball(label+'Trouser',(.13,.34,.14),'indigo',leg,(0,-.29,0))
            self.ball(label+'Shoe',(.15,.09,.22),'deep',leg,(0,-.72,.065))
        if dress:
            self.part('Long_tunic',cylinder(.34,.49,1.17,.68,20),shirt,pos=(0,1.04,0))
            self.part('Hem_band',cylinder(.485,.495,.065,.68,20),'gold',pos=(0,.49,0))
        else:
            self.part('Tunic',cylinder(.34,.4,.75,.7,20),shirt,pos=(0,1.28,0))
            self.part('Tunic_hem',cylinder(.395,.405,.045,.7,20),'gold',pos=(0,.93,0))
        self.ball('Collar',(.17,.06,.14),'cream',pos=(0,1.68,0),detail=True)
        for side,label in [(-1,'Left'),(1,'Right')]:
            arm=self.node(label+'Arm',self.root,(side*.36,1.57,0),quat((0,0,1),side*.11));self.joints[label+'Arm']=arm
            self.ball(label+'Sleeve',(.115,.265,.12),shirt,arm,(side*.035,-.22,0))
            self.ball(label+'Hand',(.105,.12,.095),skin,arm,(side*.055,-.54,0))
            self.part(label+'Cuff',cylinder(.12,.12,.055,.95,12),'gold',arm,(side*.05,-.43,0))
        head=self.node('Head',self.root,(0,2.01,0));self.joints['Head']=head
        if headscarf:
            self.ball('Headscarf_back',(.33,.37,.275),shirt,head,(0,.015,-.075))
            self.part('Scarf_drape',cylinder(.20,.36,.57,.62,16),shirt,head,(0,-.31,-.04))
        elif hair=='long':self.ball('Long_hair',(.32,.51,.23),'hair',head,(0,-.11,-.15))
        self.face(head,skin)
        if headscarf:
            self.ball('Scarf_crown',(.32,.14,.23),shirt,head,(0,.27,-.025))
            for side in [-1,1]:self.ball('Scarf_side',(.068,.29,.14),shirt,head,(side*.275,-.055,-.015))
        else:
            self.ball('Hair_cap',(.304,.15,.24),'hair',head,(0,.245,-.035))
            for i in [-1,0,1]:self.ball('Paper_hair_lock',(.11,.14,.07),'hair',head,(i*.14,.21,.165))
        return head
    def animate(self):
        animations=[]
        for clip,duration in [('Idle',3.2),('Walk',1.0),('Wave',2.4),('Celebrate',2.4)]:
            steps=64
            times=[duration*i/steps for i in range(steps+1)]; ti=self.accessor(times,'SCALAR',bounds=True); samplers=[];channels=[]
            tracks={self.root:('translation',[])}
            for key,ni in self.joints.items():tracks[ni]=('rotation',[])
            for i,t in enumerate(times):
                phase=2*math.pi*i/steps; wave=math.sin(phase)
                bounce=.015*(1-math.cos(phase))
                if clip=='Walk':bounce=.025*(1-math.cos(phase*2))
                if self.id in ['pontianak','langsuir','orang-bunian']:bounce=.045*(1-math.cos(phase))
                if self.id=='pocong' and clip=='Walk':bounce=.12*(1-math.cos(phase*2))/2
                if clip=='Celebrate':bounce=.16*(1-math.cos(phase*2))/2
                tracks[self.root][1].append([0,bounce,0])
                for key,ni in self.joints.items():
                    side=-1 if key.startswith('Left') else 1
                    axis=(0,0,1);angle=side*.11 if key.endswith('Arm') else 0
                    if key=='Head': axis=(0,1,0);angle=(.09 if clip=='Idle' else .06)*wave
                    elif clip=='Walk':axis=(1,0,0);angle=side*wave*(.48 if key.endswith('Leg') else -.36)
                    elif clip=='Wave' and key=='RightArm':angle=.11+2.3*math.sin(math.pi*i/steps)**2+.18*math.sin(phase*3)
                    elif clip=='Celebrate' and key.endswith('Arm'):angle=side*(.11+2.15*math.sin(math.pi*i/steps)**2)
                    elif key.endswith('Arm'):angle+=side*.045*wave
                    if self.id=='pocong' and key.endswith('Leg'):angle=0
                    tracks[ni][1].append(quat(axis,angle))
            for ni,(path,values) in tracks.items():
                values[-1]=list(values[0]); assert values[0]==values[-1]
                oi=self.accessor(values,'VEC3' if path=='translation' else 'VEC4')
                si=len(samplers);samplers.append({'input':ti,'output':oi,'interpolation':'LINEAR'});channels.append({'sampler':si,'target':{'node':ni,'path':path}})
            for eye in self.eyes:
                values=[]
                for i in range(steps+1):
                    phase=i/steps; distance=abs(phase-.72)
                    close=max(0,1-distance/.045)
                    values.append([1,1-.94*close,1])
                values[-1]=list(values[0])
                oi=self.accessor(values,'VEC3'); si=len(samplers)
                samplers.append({'input':ti,'output':oi,'interpolation':'LINEAR'})
                channels.append({'sampler':si,'target':{'node':eye,'path':'scale'}})
            animations.append({'name':clip,'samplers':samplers,'channels':channels})
        return animations
    def export(self):
        animations=self.animate()
        gltf={'asset':{'version':'2.0','generator':'Lantern Keeper original procedural puppet builder'},'scene':0,'scenes':[{'nodes':[self.root]}],'nodes':self.nodes,'meshes':self.meshes,'materials':self.materials,'accessors':self.accessors,'bufferViews':self.views,'buffers':[{'byteLength':len(self.bin)}],'animations':animations,'extras':{'characterId':self.id,'units':'metres','front':'+Z','up':'+Y','rig':'articulated rigid parts; no skin weights'}}
        js=json.dumps(gltf,separators=(',',':')).encode(); js+=b' '*((-len(js))%4); binary=bytes(self.bin);binary+=b'\0'*((-len(binary))%4)
        blob=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary
        (OUT/(self.id+'.glb')).write_bytes(blob)
        assert struct.unpack('<III',blob[:12])==(0x46546c67,2,len(blob))
        for view in self.views:assert view['byteOffset']+view['byteLength']<=len(self.bin)
        transforms={}
        def walk(ni,pos,q):
            node=self.nodes[ni]; local=rotate(node.get('translation',[0,0,0]),q); wp=[pos[i]+local[i] for i in range(3)];wq=qmul(q,node.get('rotation',[0,0,0,1])); transforms[ni]=(wp,wq)
            for child in node.get('children',[]):walk(child,wp,wq)
        walk(self.root,[0,0,0],[0,0,0,1])
        # CAD uses Z-up: model (X,Y,Z) becomes CAD (X,-Z,Y), in millimetres.
        lines=['0','SECTION','2','HEADER','9','$ACADVER','1','AC1015','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','ENTITIES'];allpoints=[];triangles=0
        for ni,p,faces,color in self.parts:
            pos,q=transforms[ni]; world=[]
            for point in p:
                v=rotate(point,q);world.append([v[i]+pos[i] for i in range(3)])
            allpoints.extend(world)
            for face in faces:
                triangles+=1;lines.extend(['0','3DFACE','8',(self.nodes[ni]['name']+'_'+color)[:200]])
                for corner,vi in enumerate(list(face)+[face[2]]):
                    x,y,z=world[vi]
                    for code,value in [(10+corner,x*1000),(20+corner,-z*1000),(30+corner,y*1000)]:lines.extend([str(code),f'{value:.5f}'])
        lines.extend(['0','ENDSEC','0','EOF']); (OUT/(self.id+'.dxf')).write_text('\n'.join(lines)+'\n')
        bounds={'min':[round(min(p[i] for p in allpoints),4) for i in range(3)],'max':[round(max(p[i] for p in allpoints),4) for i in range(3)]}
        return {'id':self.id,'name':self.name,'glb':'/hantu-codex/models/'+self.id+'.glb','dxf':'/hantu-codex/models/'+self.id+'.dxf','clips':['Idle','Walk','Wave','Celebrate'],'bounds':bounds,'height':round(bounds['max'][1]-bounds['min'][1],4),'triangles':triangles}

def neighbor(ident,name,shirt,skin='warm',dress=False,scarf=False,hair='short'):
    m=Model(ident,name);head=m.humanoid(shirt,skin,dress,scarf,hair)
    left=m.joints['LeftArm'];right=m.joints['RightArm']
    if ident=='ari':
        m.part('Hat_brim',cylinder(.41,.41,.055,.82,20),'gold',head,(0,.31,0));m.part('Hat_crown',cylinder(.16,.28,.22,.9,16),'cream',head,(0,.43,0))
        m.slab('Satchel',(.22,.28,.12),'terra',pos=(-.3,1.08,.24));m.slab('Field_notebook',(.19,.23,.05),'cream',left,(-.05,-.48,.1));m.lantern(right)
        m.slab('Satchel_strap',(.045,.7,.022),'gold',pos=(0,1.28,.285),rotation=quat((0,0,1),-.48))
    elif ident=='farah':
        m.slab('Recovered_pantun_book',(.32,.36,.065),'indigo',left,(-.04,-.49,.13));m.slab('Book_gold_label',(.2,.04,.01),'gold',left,(-.04,-.49,.168))
        m.ball('Scarf_pin',(.035,.035,.025),'gold',head,(.14,-.29,.18),True)
    elif ident=='mei-lin':
        m.lantern(right,color='coral');m.ball('Hair_bun',(.14,.14,.14),'hair',head,(-.24,.2,-.12))
        m.slab('Craft_paper',(.22,.3,.018),'cream',left,(-.05,-.5,.12))
    elif ident=='kavitha':
        m.slab('Kurta_placket',(.07,.43,.024),'cream',pos=(0,1.42,.255))
        m.part('Chalk_bowl',cylinder(.14,.10,.10,.8,16),'cream',right,(.04,-.56,.08));m.ball('Chalk',(.07,.025,.06),'white',right,(.04,-.50,.08),True)
    elif ident=='daniel':
        for y in [1.1,1.27,1.44,1.6]:m.ball('Shirt_button',(.017,.017,.014),'gold',pos=(0,y,.285),detail=True)
        m.slab('Gathering_invitation',(.23,.16,.025),'jade',left,(-.05,-.49,.14));m.slab('Invitation_mark',(.12,.018,.01),'gold',left,(-.05,-.49,.159))
    elif ident=='suri':
        m.slab('Everyday_woven_shawl',(.22,.77,.045),'violet',pos=(-.22,1.26,.285),rotation=quat((0,0,1),-.12))
        for i in range(7):m.slab('Generic_woven_stripe',(.18,.018,.012),'gold',pos=(-.22,1.02+i*.08,.316))
        m.slab('Repair_spool',(.17,.2,.15),'cream',right,(.05,-.56,.03));m.slab('Thread',(.18,.1,.16),'coral',right,(.05,-.56,.03))
    elif ident=='lina':
        m.slab('Field_recorder',(.17,.25,.09),'deep',right,(.05,-.49,.1));m.slab('Recorder_display',(.11,.09,.012),'jade',right,(.05,-.44,.153));m.ball('Record_button',(.02,.02,.012),'coral',right,(.05,-.53,.154),True)
    elif ident=='dina':
        m.part('Sago_plate',cylinder(.24,.24,.04,1,20),'cream',left,(-.06,-.55,.13))
        for x,z in [(-.12,.06),(0,.06),(.12,.06),(-.06,.18),(.06,.18)]:m.ball('Sago_bite',(.05,.035,.05),'gold',left,(x-.05,-.51,z),True)
    elif ident=='amina':
        m.slab('Folded_textile',(.32,.28,.14),'gold',left,(-.04,-.48,.1))
        for x in [-.14,0,.14]:m.slab('Textile_stripe',(.018,.24,.01),'cream',left,(x-.04,-.48,.178))
        m.ball('Scarf_pin',(.035,.035,.025),'gold',head,(-.14,-.29,.18),True)
    return m

def spirit(ident,name):
    m=Model(ident,name)
    if ident in ['pontianak','langsuir']:
        head=m.humanoid('cream' if ident=='pontianak' else 'jade','warm',True,False,'long')
        for side in [-1,1]:m.part('Floating_sleeve',leaf(.22,.6,.055),'cream' if ident=='pontianak' else 'jade',m.joints['LeftArm' if side<0 else 'RightArm'],(side*.06,-.2,-.03))
        if ident=='pontianak':
            for j in range(5):
                a=2*math.pi*j/5;m.ball('Flower_petal',(.055,.055,.023),'cream',head,(.22+math.cos(a)*.052,.17+math.sin(a)*.052,.18),True)
            m.ball('Flower_center',(.028,.028,.03),'gold',head,(.22,.17,.2),True);m.lantern(m.joints['RightArm'])
        else:
            for side in [-1,1]:m.part('Leaf_hair_clip',leaf(.13,.3),'gold',head,(side*.25,.2,.08),quat((0,0,1),side*-.5))
            m.slab('Borrowed_music_notes',(.25,.3,.025),'cream',m.joints['LeftArm'],(-.05,-.48,.13))
    elif ident=='toyol':
        head=m.humanoid('terra','mint',False,False,'short')
        for side in [-1,1]:m.part('Leaf_ear',leaf(.22,.37,.09),'mint',head,(side*.34,.06,0),quat((0,0,1),-side*.8))
        m.ball('Leaf_tuft',(.11,.17,.08),'jade',head,(0,.35,0))
        m.ball('Borrowed_marble',(.11,.11,.11),'gold',m.joints['RightArm'],(.05,-.58,.07))
        # Broad face and short legs make a friendly imp silhouette.
        m.nodes[head]['translation'][1]=1.84
    elif ident=='hantu-raya':
        head=m.humanoid('bark','mint',True,False,'short')
        for side in [-1,1]:
            m.ball('Leaf_shoulder',(.24,.16,.2),'leaf',pos=(side*.37,1.63,-.03))
            for j in range(3):m.part('Paper_leaf_mantle',leaf(.26,.58,.06),'leaf',pos=(side*(.25+j*.085),1.35-j*.11,-.1),rotation=quat((0,0,1),side*.32))
        for i in range(5):m.part('Leaf_crown',leaf(.2,.4,.05),'jade',head,((i-2)*.12,.37-abs(i-2)*.045,-.02),quat((0,0,1),(i-2)*-.18))
        m.ball('Gentle_guardian_nose',(.075,.06,.04),'mint',head,(0,-.01,.26),True)
    elif ident=='pocong':
        # Fictional friendly bundled-paper interpretation, with a visible smiling face.
        head=m.humanoid('cream','warm',True,True)
        m.ball('Top_knot',(.13,.17,.11),'cream',head,(0,.47,0))
        for side in [-1,1]:m.part('Paper_bow',leaf(.17,.3),'cream',head,(side*.13,.38,0),quat((0,0,1),side*-.9))
        for y in [.57,1.02,1.48]:m.part('Soft_wrap_band',cylinder(.405,.41,.045,.73,20),'gold',pos=(0,y,.005))
        m.slab('Borrowed_recipe',(.26,.28,.025),'terra',m.joints['LeftArm'],(-.05,-.49,.13))
    else:
        head=m.humanoid('jade','warm',False,False,'long')
        for side in [-1,1]:m.part('Bunian_leaf_cape',leaf(.44,1.03,.045),'indigo',pos=(side*.24,1.18,-.24),rotation=quat((0,0,1),side*.25))
        for i in range(5):m.part('Leaf_circlet',leaf(.105,.22),'gold',head,((i-2)*.105,.29,.16),quat((0,0,1),(i-2)*-.22))
        m.lantern(m.joints['RightArm'],color='jade')
    return m

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    models=[
        neighbor('ari','Ari','jade'),
        neighbor('farah','Farah','violet','warm',True,True),
        neighbor('mei-lin','Mei Lin','coral','warm',False,False,'short'),
        neighbor('kavitha','Kavitha','violet','darkskin',True,False,'long'),
        neighbor('daniel','Daniel','cream','skin'),
        neighbor('suri','Suri','indigo','skin',False,False,'long'),
        neighbor('lina','Lina','jade','warm',False,False,'long'),
        neighbor('dina','Dina','terra','skin',True,False,'long'),
        neighbor('amina','Amina','jade','warm',True,True),
    ]+[spirit(i,n) for i,n in [('pontianak','Pontianak'),('toyol','Toyol'),('hantu-raya','Hantu Raya'),('langsuir','Langsuir'),('pocong','Pocong'),('orang-bunian','Orang Bunian')]]
    manifest=[m.export() for m in models]
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    readme='''LANTERN KEEPER — ORIGINAL CHARACTER MODEL PACK\n\n15 original procedural puppet characters, each supplied as GLB 2.0 and DXF.\nGLB: metres, +Y up, +Z forward, four seamless node-animation clips named Idle, Walk, Wave, Celebrate. Articulated rigid parts; not a skinned humanoid rig.\nDXF: static assembled rest pose, 3DFACE geometry, millimetres, +Z up. Layers identify part and material. Open as a polygon mesh drawing, not editable parametric solids.\nCharacter dimensions and individual filenames are in manifest.json.\nNo external artwork or meshes used. Friendly fictional spirit interpretations and everyday neighbor clothing; not authoritative cultural or religious representations.\nTo rebuild: python3 scripts/build-character-models.py in the project source.\n'''
    (OUT/'README.txt').write_text(readme)
    with zipfile.ZipFile(OUT/'characters.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for file in sorted(OUT.iterdir()):
            if file.suffix in ['.glb','.dxf'] or file.name in ['README.txt','manifest.json']:archive.write(file,file.name)
    for item in manifest:print(item['id'],item['height'],item['triangles'],item['bounds'])
    print('Validated 15 GLB headers, buffers, normals, triangles, 4 seamless clips each; wrote DXF and ZIP.')

if __name__=='__main__':main()
