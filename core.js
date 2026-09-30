import * as THREE from './three.module.js';
import {WebGLRenderTarget,OrthographicCamera,ShaderMaterial} from './three.module.js';

const RED=0xED1F2C, INDIGO=0x2B3C92, INK=0x211F1F, PLUM=0x352D57, PAPER=0xFFFFFF, COOL=0xCFD9DF, BG=0x05050A;
const C_RED='#ED1F2C', C_INDIGO='#8FA0E8', C_WHITE='#FFFFFF', C_DIM='#98A0B8';

const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
stage.appendChild(renderer.domElement);

const scene=new THREE.Scene();
scene.background=new THREE.Color(BG);
scene.fog=new THREE.FogExp2(BG,0.00115);

const camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,0.5,4600);
scene.add(camera);
scene.add(new THREE.HemisphereLight(0x8492d6,0x101528,1.35));
const keyLight=new THREE.DirectionalLight(0xfff2e2,2.9); keyLight.position.set(16,28,18); scene.add(keyLight);
const rimRed=new THREE.DirectionalLight(RED,2.4); rimRed.position.set(-22,9,-12); scene.add(rimRed);
const rimBlue=new THREE.DirectionalLight(0x93a8ff,1.7); rimBlue.position.set(10,6,-26); scene.add(rimBlue);
const fillWarm=new THREE.DirectionalLight(0xffb37a,0.7); fillWarm.position.set(-14,4,20); scene.add(fillWarm);

const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOut=t=>1-Math.pow(1-t,3);
const easeBack=t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
const rnd=(a,b)=>a+Math.random()*(b-a);

let CUR=null;
function bindMats(mats){ CUR=mats?{g:null,mats}:null; }
const reg=m=>{
  if(CUR){
    CUR.mats.push(m);
    if(m.userData.base===undefined) m.userData.base=(m.opacity===undefined?1:m.opacity);
  }
  return m;
};
const std=o=>reg(new THREE.MeshStandardMaterial(Object.assign({roughness:.62,metalness:.14},o)));
const bas=o=>{
  const hasMap=!!o.map;
  const m=new THREE.MeshBasicMaterial(o);
  if(hasMap){ m.transparent=true; m.depthWrite=false; m.userData.alwaysT=true; }
  return reg(m);
};
const glow=o=>reg(new THREE.MeshBasicMaterial(Object.assign({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending},o)));

function group3d(fn){
  const g=new THREE.Group(), mats=[], prev=CUR;
  CUR={g,mats};
  fn(g);
  CUR=prev;
  g.userData.mats=mats;
  return g;
}
const add=(g,geo,mat,x=0,y=0,z=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); g.add(m); return m; };
const box=(g,w,h,d,mat,x=0,y=0,z=0)=>add(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
const cyl=(g,rt,rb,h,seg,mat,x=0,y=0,z=0)=>add(g,new THREE.CylinderGeometry(rt,rb,h,seg),mat,x,y,z);
const sph=(g,r,mat,x=0,y=0,z=0,ws=14,hs=10)=>add(g,new THREE.SphereGeometry(r,ws,hs),mat,x,y,z);
const tor=(g,r,t,mat,x=0,y=0,z=0,rs=8,ts=48,arc=TAU)=>add(g,new THREE.TorusGeometry(r,t,rs,ts,arc),mat,x,y,z);

function sky(){
  if(!DOT) DOT=dotTex();
  const N=4200, pos=new Float32Array(N*3), col=new Float32Array(N*3), sz=new Float32Array(N);
  const c=new THREE.Color();
  for(let i=0;i<N;i++){
    const u=Math.random()*2-1, th=Math.random()*TAU, s=Math.sqrt(1-u*u);
    const r=900+Math.random()*900;
    pos[i*3]=s*Math.cos(th)*r; pos[i*3+1]=u*r*0.7; pos[i*3+2]=s*Math.sin(th)*r;
    c.setHSL(0.60+Math.random()*0.08, 0.35, 0.45+Math.random()*0.45);
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    sz[i]=0.5+Math.random()*1.6;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.PointsMaterial({size:3.2,map:DOT,vertexColors:true,transparent:true,opacity:0.75,depthWrite:false,sizeAttenuation:true,blending:THREE.AdditiveBlending});
  const p=new THREE.Points(g,m);
  p.frustumCulled=false;
  scene.add(p);
  p.userData.tw=true;

  /* ambient dust motes drifting near the camera plane */
  const DN=340, dpos=new Float32Array(DN*3), dcol=new Float32Array(DN*3), dsz=new Float32Array(DN);
  for(let i=0;i<DN;i++){
    dpos[i*3]=rnd(-160,160); dpos[i*3+1]=rnd(-20,90); dpos[i*3+2]=rnd(-160,160);
    const warm=Math.random()<0.30;
    c.setHex(warm?0xED1F2C:0x9FB2FF);
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    dsz[i]=0.4+Math.random()*1.1;
  }
  const dg=new THREE.BufferGeometry();
  dg.setAttribute('position',new THREE.BufferAttribute(dpos,3));
  dg.setAttribute('color',new THREE.BufferAttribute(dcol,3));
  const dm=new THREE.PointsMaterial({size:2.2,map:DOT,vertexColors:true,transparent:true,opacity:0.34,depthWrite:false,sizeAttenuation:true,blending:THREE.AdditiveBlending});
  const dust=new THREE.Points(dg,dm);
  dust.frustumCulled=false;
  scene.add(dust);

  const gp=[];
  const R=1500, step=60;
  for(let i=-R;i<=R;i+=step){
    gp.push(-R,0,-R, R,0,-R,  -R,0,R, R,0,R,  -R,0,-R, -R,0,R,  R,0,-R, R,0,R);
    gp.push(-R,0,i, R,0,i,  i,0,-R, i,0,R);
  }
  const gg=new THREE.BufferGeometry();
  gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));
  const grid=new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0x1B2440,transparent:true,opacity:0.30,depthWrite:false}));
  grid.position.y=-1.2;
  scene.add(grid);
  return {p,dust,grid};
}

function roundRect(g,x,y,w,h,r){
  g.beginPath();
  g.moveTo(x+r,y);
  g.lineTo(x+w-r,y); g.quadraticCurveTo(x+w,y,x+w,y+r);
  g.lineTo(x+w,y+h-r); g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  g.lineTo(x+r,y+h); g.quadraticCurveTo(x,y+h,x,y+h-r);
  g.lineTo(x,y+r); g.quadraticCurveTo(x,y,x+r,y);
  g.closePath();
}
function wrapText(g,text,maxW){
  const out=[];
  String(text).split('\n').forEach(par=>{
    const words=par.split(/\s+/).filter(Boolean);
    if(!words.length){ out.push(''); return; }
    let line=words[0];
    for(let i=1;i<words.length;i++){
      const t=line+' '+words[i];
      if(g.measureText(t).width>maxW){ out.push(line); line=words[i]; } else line=t;
    }
    out.push(line);
  });
  return out;
}
const SERIF='"Fraunces",Georgia,"Times New Roman",serif';
const SANS='"Inter","Segoe UI",system-ui,-apple-system,Arial,sans-serif';
const PX=34;

class Panel{
  constructor(w,h,opt){
    this.w=w; this.h=h;
    this.o=Object.assign({bg:'rgba(8,9,17,0.80)',border:'rgba(207,217,223,0.20)',pad:0.62,rad:0.16},opt||{});
    this.c=document.createElement('canvas');
    this.c.width=Math.max(2,Math.round(w*PX));
    this.c.height=Math.max(2,Math.round(h*PX));
    this.g=this.c.getContext('2d');
    this.tex=new THREE.CanvasTexture(this.c);
    this.tex.colorSpace=THREE.SRGBColorSpace;
    this.tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    this.mat=bas({map:this.tex,side:THREE.DoubleSide});
    this.mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),this.mat);
  }
  set(blocks,st){
    st=st||{};
    const g=this.g,W=this.c.width,H=this.c.height,o=this.o,pad=o.pad*PX;
    g.clearRect(0,0,W,H);
    g.fillStyle=o.bg; roundRect(g,2,2,W-4,H-4,(o.rad||0.16)*PX); g.fill();
    if(o.border!=='none'){ g.strokeStyle=o.border; g.lineWidth=2.2; g.stroke(); }
    const plan=[]; let total=0;
    for(const b of blocks){
      const size=(b.s||0.6)*PX;
      const fam=b.serif?SERIF:SANS;
      g.font=(b.w||400)+' '+size+'px '+fam;
      const lines=wrapText(g,b.t,W-pad*2);
      const lh=size*(b.lh||1.30);
      const hh=lines.length*lh+(b.sp||0)*PX+(b.gap||0)*PX;
      plan.push({b,size,fam,lines,lh});
      total+=hh;
    }
    let y;
    if(st.top) y=pad; else y=Math.max(pad,(H-total)/2);
    if(o.accent){ g.fillStyle=o.accent; g.fillRect(pad*0.55,pad*0.55,W-pad*1.1,0.11*PX); }
    if(!st.top&&o.accent) y=Math.max(pad,y+0.30*PX);
    for(const p of plan){
      y+=(p.b.sp||0)*PX;
      g.font=(p.b.w||400)+' '+p.size+'px '+p.fam;
      g.fillStyle=p.b.c||C_WHITE;
      g.textBaseline='top';
      const al=p.b.a||'left';
      g.textAlign=al;
      const x=al==='center'?W/2:al==='right'?W-pad:pad;
      for(const L of p.lines){ g.fillText(L,x,y); y+=p.lh; }
      y+=(p.b.gap||0)*PX;
    }
    this.tex.needsUpdate=true;
    return this;
  }
  at(g,x,y,z,rx,ry){
    this.mesh.position.set(x||0,y||0,z||0);
    if(rx) this.mesh.rotation.x=rx;
    if(ry) this.mesh.rotation.y=ry;
    g.add(this.mesh);
    return this.mesh;
  }
}

function screenTex(w,h,draw){
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const g=c.getContext('2d');
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;
  t.anisotropy=4;
  draw(g,w,h);
  return {c,g,t};
}

function sparkleShape(R,pull){
  pull=pull||0.29;
  const s=new THREE.Shape(), T=[];
  for(let i=0;i<4;i++){ const a=-Math.PI/2+i*Math.PI/2; T.push([Math.cos(a)*R,Math.sin(a)*R]); }
  s.moveTo(T[0][0],T[0][1]);
  for(let i=1;i<=4;i++){
    const p=T[i%4], pv=T[(i-1)%4];
    s.quadraticCurveTo((pv[0]+p[0])*0.5*pull,(pv[1]+p[1])*0.5*pull,p[0],p[1]);
  }
  s.closePath();
  return s;
}
function chevronShape(w,h,dip){
  const s=new THREE.Shape();
  s.moveTo(-w/2,0); s.lineTo(-w/2,-h-dip); s.lineTo(0,-h); s.lineTo(w/2,-h-dip); s.lineTo(w/2,0); s.closePath();
  return s;
}
function sparkMesh(R,col,emissive){
  const geo=new THREE.ExtrudeGeometry(sparkleShape(R),{depth:R*0.20,bevelEnabled:true,bevelSize:R*0.055,bevelThickness:R*0.055,bevelSegments:2,curveSegments:14});
  geo.center();
  const o=new THREE.Mesh(geo,bas({color:col}));
  if(emissive){
    const h=new THREE.Mesh(geo,glow({color:emissive,opacity:0.20}));
    h.position.z=-0.04;
    o.add(h);
  }
  return o;
}
function chevMesh(w,h,dip,col,opacity){
  const geo=new THREE.ExtrudeGeometry(chevronShape(w,h,dip),{depth:0.3,bevelEnabled:false});
  const op=opacity===undefined?1:opacity;
  return new THREE.Mesh(geo,bas({color:col,opacity:op}));
}

let DOT=null;
function dotTex(){
  const c=document.createElement('canvas'); c.width=64; c.height=64;
  const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');
  gr.addColorStop(0.32,'rgba(255,255,255,0.62)');
  gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
function softSprite(col,size,op){
  if(!DOT) DOT=dotTex();
  const s=new THREE.Sprite(reg(new THREE.SpriteMaterial({map:DOT,color:col,transparent:true,opacity:op===undefined?1:op,depthWrite:false,blending:THREE.AdditiveBlending})));
  s.scale.set(size,size,1);
  return s;
}

function envMap(){
  const c=document.createElement('canvas'); c.width=256; c.height=128;
  const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,'#33406E');
  gr.addColorStop(0.42,'#161C34');
  gr.addColorStop(0.52,'#0B0E19');
  gr.addColorStop(1,'#06070E');
  g.fillStyle=gr; g.fillRect(0,0,256,128);
  const warm=g.createRadialGradient(72,30,0,72,30,66);
  warm.addColorStop(0,'rgba(255,220,190,0.95)');
  warm.addColorStop(1,'rgba(255,220,190,0)');
  g.fillStyle=warm; g.fillRect(0,0,256,128);
  const red=g.createRadialGradient(196,58,0,196,58,60);
  red.addColorStop(0,'rgba(237,31,44,0.80)');
  red.addColorStop(1,'rgba(237,31,44,0)');
  g.fillStyle=red; g.fillRect(0,0,256,128);
  const blue=g.createRadialGradient(130,96,0,130,96,70);
  blue.addColorStop(0,'rgba(80,120,255,0.55)');
  blue.addColorStop(1,'rgba(80,120,255,0)');
  g.fillStyle=blue; g.fillRect(0,0,256,128);
  const t=new THREE.CanvasTexture(c);
  t.mapping=THREE.EquirectangularReflectionMapping;
  t.colorSpace=THREE.SRGBColorSpace;
  const pm=new THREE.PMREMGenerator(renderer);
  pm.compileEquirectangularShader();
  const rt=pm.fromEquirectangular(t);
  scene.environment=rt.texture;
  pm.dispose(); t.dispose();
}
envMap();

const hx=n=>'#'+(n>>>0).toString(16).padStart(6,'0').slice(-6);

function radialTex(inner,outer,stops){
  const c=document.createElement('canvas'); c.width=c.height=256;
  const g=c.getContext('2d');
  const gr=g.createRadialGradient(128,128,inner,128,128,outer);
  stops.forEach(s=>gr.addColorStop(s[0], typeof s[1]==='number'?hx(s[1]):s[1]));
  g.fillStyle=gr; g.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;
  return t;
}

function backdrop(w,h,col,op){
  const t=radialTex(0,w*0.42,[[0,col],[0.45,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0)']]);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending}));
  return m;
}

function stageBase(r,accent){
  const g=new THREE.Group();
  const ac=accent||INDIGO;

  const bd=softSprite(ac,r*2.6,0.13);
  bd.position.set(0,1.2,0);
  g.add(bd);

  const floor=add(g,new THREE.CircleGeometry(r,96),bas({color:0x0A0D18}),0,0.015,0);
  const ft=radialTex(0,r*0.52,[[0,'#1D2440'],[0.5,'#141A2E'],[1,'#0A0D18']]);
  floor.material=bas({map:ft,color:0xffffff});
  floor.rotation.x=-Math.PI/2;

  cyl(g,r*0.998,r*0.955,1.5,96,std({color:0x141A2C,roughness:.85,metalness:.2}),0,-0.76,0);
  cyl(g,r*0.95,r*0.90,0.5,96,std({color:0x1B2238,roughness:.8,metalness:.25}),0,-0.30,0);

  const rim=tor(g,r*0.985,0.11,glow({color:ac,opacity:0.85}),0,0.06,0,8,180);
  rim.rotation.x=Math.PI/2;
  const rim2=tor(g,r*0.93,0.05,glow({color:RED,opacity:0.45}),0,0.06,0,6,160);
  rim2.rotation.x=Math.PI/2;
  const ring3=tor(g,r*0.80,0.035,glow({color:0x7E90D8,opacity:0.26}),0,0.055,0,6,150);
  ring3.rotation.x=Math.PI/2;
  const ring4=tor(g,r*0.62,0.03,glow({color:0x7E90D8,opacity:0.16}),0,0.055,0,6,140);
  ring4.rotation.x=Math.PI/2;

  for(let i=0;i<48;i++){
    const a=i*TAU/48, big=i%4===0;
    const t0=big?0.885:0.905, t1=0.955;
    const tk=box(g,big?0.16:0.09,0.03,big?0.9:0.55,glow({color:big?ac:0x6E7BB0,opacity:big?0.6:0.28}),
      Math.cos(a)*r*(t0+t1)/2,0.05,Math.sin(a)*r*(t0+t1)/2);
    tk.rotation.y=-a;
  }

  const bgl=backdrop(r*5.2,r*3.4,ac,0.20);
  bgl.position.set(0,r*0.85,-r*1.5);
  g.add(bgl);
  const bgr=backdrop(r*3.4,r*2.6,RED,0.13);
  bgr.position.set(0,r*0.7,r*1.9);
  bgr.rotation.y=Math.PI;
  g.add(bgr);

  g.userData.rings=[rim,rim2,ring3,ring4];
  return g;
}

function standDesk(g,w,d,h,mat,topMat){
  const tm=topMat||std({color:0x2A3048,roughness:.5,metalness:.35});
  box(g,w,0.22,d,tm,0,h,0);
  box(g,0.22,h,0.22,mat,-w/2+0.5,h/2,0);
  box(g,0.22,h,0.22,mat,w/2-0.5,h/2,0);
  box(g,w*0.7,0.16,0.3,mat,0,h*0.35,0);
}

function monitor(g,w,h,tex,x,y,z,ry){
  const m=new THREE.Group();
  box(m,w*1.06,h*1.14,0.16,std({color:0x171B28,roughness:.45,metalness:.5}),0,0,0);
  box(m,w,h,0.03,bas({map:tex}),0,0,0.09);
  box(m,0.16,0.5,0.16,std({color:0x171B28}),0,-h*0.72,-0.1);
  box(m,w*0.5,0.1,0.4,std({color:0x171B28}),0,-h*0.95,-0.1);
  m.position.set(x,y,z);
  if(ry) m.rotation.y=ry;
  g.add(m);
  return m;
}

function student(cfg){
  cfg=cfg||{};
  const g=new THREE.Group();
  const skin=std({color:cfg.skin||0xC08A63,roughness:.75});
  const shirt=std({color:cfg.shirt||INDIGO,roughness:.82});
  const pants=std({color:cfg.pants||0x191C2A,roughness:.88});
  const hair=std({color:cfg.hair||0x17120E,roughness:.95});
  const t=add(g,new THREE.CapsuleGeometry(0.20,0.40,4,10),shirt,0,1.00,0);
  add(g,new THREE.SphereGeometry(0.155,14,10),skin,0,1.44,0);
  add(g,new THREE.SphereGeometry(0.163,14,9,0,TAU,0,1.45),hair,0,1.475,0);
  const aGeo=new THREE.CapsuleGeometry(0.072,0.30,3,8);
  const lGeo=new THREE.CapsuleGeometry(0.086,0.36,3,8);
  const armL=new THREE.Group(), armR=new THREE.Group(), legL=new THREE.Group(), legR=new THREE.Group();
  armL.position.set(-0.265,1.20,0); armR.position.set(0.265,1.20,0);
  legL.position.set(-0.105,0.80,0); legR.position.set(0.105,0.80,0);
  add(armL,aGeo,shirt,0,-0.21,0);
  add(armR,aGeo,shirt,0,-0.21,0);
  add(legL,lGeo,pants,0,-0.23,0);
  add(legR,lGeo,pants,0,-0.23,0);
  g.add(armL,armR,legL,legR);
  g.scale.setScalar(1.45);
  g.userData={armL,armR,legL,legR,torso:t,phase:rnd(0,TAU),speed:rnd(8.5,10.5)};
  return g;
}
function animStudent(s,t,mode){
  const u=s.userData,p=u.phase+t*u.speed;
  const a=Math.sin(p), b=Math.sin(p+Math.PI);
  u.armL.rotation.z=0.15; u.armR.rotation.z=-0.15;
  if(mode==='run'){
    u.legL.rotation.x=a*0.9; u.legR.rotation.x=b*0.9;
    u.armL.rotation.x=b*0.66; u.armR.rotation.x=a*0.66;
    s.position.y=Math.abs(Math.cos(p))*0.075;
    u.torso.rotation.x=0.22;
  } else if(mode==='work'){
    const q=Math.sin(t*2.4+u.phase);
    u.legL.rotation.x=0; u.legR.rotation.x=0;
    u.armL.rotation.x=-1.12-q*0.45; u.armR.rotation.x=-1.22+q*0.40;
    u.armL.rotation.z=0.30; u.armR.rotation.z=-0.30;
    s.position.y=0; u.torso.rotation.x=0.06+Math.sin(t*1.3+u.phase)*0.05;
  } else if(mode==='present'){
    u.legL.rotation.x=0; u.legR.rotation.x=0;
    u.armL.rotation.x=-0.28; u.armR.rotation.x=-1.42+Math.sin(t*2.1+u.phase)*0.24;
    u.armL.rotation.z=0.20; u.armR.rotation.z=-0.52;
    s.position.y=0; u.torso.rotation.x=0;
  } else if(mode==='type'){
    const q=Math.sin(t*7.5+u.phase);
    u.legL.rotation.x=0; u.legR.rotation.x=0;
    u.armL.rotation.x=-0.98+q*0.22; u.armR.rotation.x=-0.98-q*0.22;
    u.armL.rotation.z=0.24; u.armR.rotation.z=-0.24;
    s.position.y=0; u.torso.rotation.x=0.13;
  } else if(mode==='shoot'){
    const q=Math.sin(t*2.9+u.phase);
    u.legL.rotation.x=0; u.legR.rotation.x=0;
    u.armL.rotation.x=-1.34+q*0.16; u.armR.rotation.x=-1.40-q*0.16;
    u.armL.rotation.z=0.16; u.armR.rotation.z=-0.16;
    s.position.y=0; u.torso.rotation.x=0.05;
  } else if(mode==='stand'){
    u.legL.rotation.x=0; u.legR.rotation.x=0;
    u.armL.rotation.x=Math.sin(t*1.5+u.phase)*0.13; u.armR.rotation.x=-Math.sin(t*1.5+u.phase)*0.13;
    s.position.y=0; u.torso.rotation.x=0;
  }
}
function walker(g,opts){
  opts=opts||{};
  const s=student(opts);
  g.add(s);
  const w={s,r:opts.r||20,sp:opts.speed||3.2,y0:opts.y0||0,ph:opts.ph||0};
  s.position.y=w.y0;
  s.rotation.y=opts.face||0;
  if(!g.userData.walkers) g.userData.walkers=[];
  g.userData.walkers.push(w);
  return w;
}
function runWalkers(g,t){
  const ws=g.userData.walkers;
  if(!ws) return;
  for(const w of ws){
    const a=w.ph+t*w.sp/w.r;
    w.s.position.set(Math.cos(a)*w.r,w.y0,Math.sin(a)*w.r);
    w.s.rotation.y=-a-Math.PI/2;
    animStudent(w.s,t+w.s.userData.phase,'run');
  }
}

function phoneBody(g,w,h,tex,x,y,z){
  const grp=new THREE.Group();
  box(grp,w,h,h*0.075,std({color:0x1A1E2B,roughness:.34,metalness:.72}),0,0,0);
  const s=box(grp,w*0.895,h*0.915,0.02,bas({map:tex}),0,0,h*0.039);
  grp.add(s);
  grp.position.set(x||0,y||0,z||0);
  g.add(grp);
  grp.userData.screen=s;
  return grp;
}

function filmCamera(g,sc){
  sc=sc||1;
  const grp=new THREE.Group();
  box(grp,2.0*sc,1.5*sc,2.6*sc,std({color:0x14171F,roughness:.45,metalness:.6}),0,0,0);
  box(grp,1.1*sc,0.9*sc,1.1*sc,std({color:0x1E222E,roughness:.5,metalness:.5}),1.3*sc,0.2*sc,0);
  const lens=cyl(grp,0.62*sc,0.72*sc,1.5*sc,20,std({color:0x0D1017,roughness:.28,metalness:.85}),-0.2*sc,-0.1*sc,-1.9*sc);
  lens.rotation.x=Math.PI/2;
  const gl=cyl(grp,0.56*sc,0.56*sc,0.08*sc,20,glow({color:0x3d6bd6,opacity:0.5}),-0.2*sc,-0.1*sc,-2.62*sc);
  gl.rotation.x=Math.PI/2;
  cyl(grp,0.72*sc,0.72*sc,0.22*sc,22,std({color:0x1C2029,roughness:.4,metalness:.7}),0.55*sc,1.15*sc,0.5*sc);
  cyl(grp,0.72*sc,0.72*sc,0.22*sc,22,std({color:0x1C2029,roughness:.4,metalness:.7}),-0.75*sc,1.15*sc,0.9*sc);
  box(grp,0.16*sc,1.1*sc,0.16*sc,std({color:0x2A3040,metalness:.7}),0,1.9*sc,-0.4*sc);
  g.add(grp);
  return grp;
}
function tripod(g,h,sc){
  sc=sc||1;
  const grp=new THREE.Group();
  cyl(grp,0.09*sc,0.11*sc,h*0.55,10,std({color:0x2A3040,roughness:.5,metalness:.6}),0,h*0.275,0);
  for(let i=0;i<3;i++){
    const a=i*TAU/3;
    const leg=box(grp,0.09*sc,h*0.62,0.09*sc,std({color:0x232838,metalness:.55}),Math.cos(a)*0.42*sc,h*0.26,Math.sin(a)*0.42*sc);
    leg.rotation.z=Math.cos(a)*-0.28;
    leg.rotation.x=Math.sin(a)*0.28;
  }
  g.add(grp);
  return grp;
}
function lightStand(g,h,col){
  const grp=new THREE.Group();
  cyl(grp,0.09,0.13,h,8,std({color:0x232838,metalness:.6}),0,h/2,0);
  for(let i=0;i<3;i++){
    const a=i*TAU/3;
    const leg=box(grp,0.07,h*0.30,0.07,std({color:0x1B2030}),Math.cos(a)*0.34,h*0.15,Math.sin(a)*0.34);
    leg.rotation.z=Math.cos(a)*-0.5; leg.rotation.x=Math.sin(a)*0.5;
  }
  box(grp,1.5,1.0,0.35,std({color:0x161A25,roughness:.5,metalness:.5}),0,h,0);
  box(grp,1.35,0.86,0.06,glow({color:col,opacity:0.85}),0,h,-0.21);
  const sp=softSprite(col,4.6,0.32);
  sp.position.set(0,h,-0.7);
  grp.add(sp);
  g.add(grp);
  return grp;
}
function clapboard(g,sc){
  sc=sc||1;
  const grp=new THREE.Group();
  box(grp,3.4*sc,2.1*sc,0.22*sc,std({color:0x15181F,roughness:.55}),0,0,0);
  const st=screenTex(256,160,(c,w,h)=>{
    c.fillStyle='#101318'; c.fillRect(0,0,w,h);
    c.fillStyle='#ED1F2C';
    for(let i=-1;i<12;i++){ c.save(); c.translate(i*28,0); c.rotate(0.5); c.fillRect(0,-20,14,220); c.restore(); }
    c.fillStyle='rgba(16,19,24,0.92)'; c.fillRect(0,86,w,74);
    c.fillStyle='#CFD9DF'; c.font='700 26px '+SANS; c.fillText('SCENE 04',16,120);
    c.fillStyle='#8E97AF'; c.font='400 19px '+SANS; c.fillText('TAKE 06  ·  BUE FCMM',16,148);
  }).t;
  box(grp,3.2*sc,1.9*sc,0.03,bas({map:st}),0,0,0.13*sc);
  const top=new THREE.Group();
  top.position.set(0,1.15*sc,0.02*sc);
  box(top,3.4*sc,0.9*sc,0.2*sc,std({color:0x1B1F28,roughness:.5}),0,0.45*sc,0);
  const hinge=cyl(top,0.09*sc,0.09*sc,3.4*sc,10,std({color:0x3A4258,metalness:.6}),0,0,0);
  hinge.rotation.z=Math.PI/2;
  grp.add(top);
  top.rotation.x=-0.55;
  g.add(grp);
  return grp;
}
function boomMic(g,sc){
  sc=sc||1;
  const grp=new THREE.Group();
  cyl(grp,0.13*sc,0.16*sc,3.2*sc,8,std({color:0x1C2130,metalness:.55}),0,0,0);
  grp.rotation.z=Math.PI/2;
  cyl(grp,0.40*sc,0.40*sc,1.1*sc,14,std({color:0x2A3040,metalness:.6,roughness:.35}),2.0*sc,0,0);
  cyl(grp,0.46*sc,0.46*sc,0.14*sc,14,glow({color:0x8FA0E8,opacity:0.5}),2.0*sc,0,0);
  g.add(grp);
  return grp;
}
function arrowGeo(len,col){
  const grp=new THREE.Group();
  box(grp,len,0.13,0.13,glow({color:col,opacity:0.85}),len/2,0,0);
  const head=add(grp,new THREE.ConeGeometry(0.34,0.9,4),glow({color:col,opacity:0.85}),len+0.35,0,0);
  head.rotation.z=-Math.PI/2;
  return grp;
}

const EGYPT=[[25.0,31.6],[29.0,31.4],[32.6,31.3],[34.25,31.5],[34.9,29.5],[34.3,27.7],[33.2,28.6],[32.6,29.9],[32.3,27.5],[33.5,26.0],[34.5,24.5],[35.5,23.9],[36.4,22.0],[37.2,21.0],[36.0,20.0],[34.0,21.8],[32.0,22.0],[31.0,24.0],[29.0,27.0],[27.0,29.0]];
function egyptGeo(scale,depth){
  const s=new THREE.Shape();
  EGYPT.forEach((p,i)=>{
    const x=(p[0]-31.0)*scale, y=(p[1]-26.0)*scale;
    if(i===0) s.moveTo(x,y); else s.lineTo(x,y);
  });
  s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:depth,bevelEnabled:true,bevelSize:scale*0.05,bevelThickness:scale*0.04,bevelSegments:2});
  g.rotateX(-Math.PI/2);
  g.computeBoundingBox();
  const b=g.boundingBox;
  g.translate(-(b.min.x+b.max.x)/2, -b.min.y, -(b.min.z+b.max.z)/2);
  return g;
}

function egyptOutline(scale,y){
  const pts=[];
  EGYPT.forEach(p=>pts.push((p[0]-31.0)*scale,y,(p[1]-26.0)*scale));
  pts.push((EGYPT[0][0]-31.0)*scale,y,(EGYPT[0][1]-26.0)*scale);
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  return g;
}

function egyptBorder(scale,y,color){
  const grp=new THREE.Group();
  [-0.34,0,0.34].forEach(dy=>{
    const m=new THREE.LineBasicMaterial({color,transparent:true,opacity:dy===0?1:0.55});
    grp.add(new THREE.Line(egyptOutline(scale,y+dy),m));
  });
  return grp;
}

function bldg(g,w,h,d,opts){
  opts=opts||{};
  const brick=std({color:opts.brick||0x8E3A32,roughness:.9});
  const stone=std({color:opts.stone||0xD8CFC0,roughness:.85});
  const glass=std({color:opts.glass||0x2C3C6E,roughness:.16,metalness:.6,emissive:0x101C3A,emissiveIntensity:.6});
  box(g,w,h,d,brick,0,h/2,0);
  box(g,w+0.5,0.5,d+0.5,stone,0,h+0.2,0);
  const rows=Math.max(1,Math.floor(h/2.4));
  for(let i=1;i<rows;i++){
    const y=i*(h/rows);
    box(g,w+0.12,0.20,d+0.12,stone,0,y,0);
    for(let k=-1;k<=1;k++){
      box(g,w*0.19,1.25,0.14,glass,k*w*0.3,y+h/rows*0.5,d/2+0.06);
      box(g,w*0.19,1.25,0.14,glass,k*w*0.3,y+h/rows*0.5,-d/2-0.06);
    }
  }
}
function pitchedRoof(g,w,h,d,col){
  const s=new THREE.Shape();
  s.moveTo(-w/2,0); s.lineTo(w/2,0); s.lineTo(0,h); s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});
  geo.translate(0,0,-d/2);
  return add(g,geo,std({color:col||0x3A2E2A,roughness:.9}));
}
function flagPole(g,h){
  const grp=new THREE.Group();
  cyl(grp,0.11,0.14,h,8,std({color:0xC9CEDA,metalness:.6,roughness:.4}),0,h/2,0);
  box(grp,2.6,1.6,0.07,std({color:RED,roughness:.75,emissive:RED,emissiveIntensity:.22}),1.35,h-0.95,0);
  box(grp,0.9,0.55,0.08,std({color:0x1E2440,roughness:.8}),1.85,h-0.5,0);
  g.add(grp);
  return grp;
}

function wireGlobe(g,r,col,op){
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),bas({color:col,wireframe:true,opacity:op,transparent:op<1}));
  g.add(m);
  return m;
}
function ringLines(g,r,col,op,n){
  n=n||5;
  const grp=new THREE.Group();
  for(let i=0;i<n;i++){
    const t=tor(grp,r,0.045,glow({color:col,opacity:op}),0,0,0,5,110);
    t.rotation.set(rnd(0,TAU),rnd(0,TAU),rnd(0,TAU));
  }
  g.add(grp);
  return grp;
}
function paperFlight(g,tex,sc){
  sc=sc||1;
  return box(g,1.9*sc,2.5*sc,0.07*sc,bas({map:tex}),0,0,0);
}

const SKY=sky();

/* ============================ POST-PROCESSING ============================ */
/* scene -> rtA -> [FXAA] -> rtB -> [bloom, downsampled] -> composite into rtA2
   -> [filmic grade: vignette + grain + chromatic aberration] -> screen       */
const post={ready:false};
function fxaaShader(){
  return {
    uniforms:{ tDiffuse:{value:null}, resolution:{value:new THREE.Vector2(1,1)} },
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:[
      'uniform sampler2D tDiffuse; uniform vec2 resolution; varying vec2 vUv;',
      '#ifndef FXAA_REDUCE_MUL', '#define FXAA_REDUCE_MUL (1.0/8.0)', '#endif',
      '#ifndef FXAA_SPAN_MAX', '#define FXAA_SPAN_MAX 8.0', '#endif',
      'void main(){',
      ' vec2 invRes=1.0/resolution;',
      ' vec3 rgbNW=texture2D(tDiffuse,(vUv+vec2(-1.0,-1.0)*invRes).xy).rgb;',
      ' vec3 rgbNE=texture2D(tDiffuse,(vUv+vec2(1.0,-1.0)*invRes).xy).rgb;',
      ' vec3 rgbSW=texture2D(tDiffuse,(vUv+vec2(-1.0,1.0)*invRes).xy).rgb;',
      ' vec3 rgbSE=texture2D(tDiffuse,(vUv+vec2(1.0,1.0)*invRes).xy).rgb;',
      ' vec3 rgbM=texture2D(tDiffuse,vUv).rgb;',
      ' vec3 luma=vec3(0.299,0.587,0.114);',
      ' float lNW=dot(rgbNW,luma), lNE=dot(rgbNE,luma), lSW=dot(rgbSW,luma), lSE=dot(rgbSE,luma), lM=dot(rgbM,luma);',
      ' float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE)));',
      ' float lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));',
      ' vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));',
      ' float dirReduce=max((lNW+lNE+lSW+lSE)*0.25*FXAA_REDUCE_MUL,1.0/128.0);',
      ' float rcpDirMin=1.0/(min(abs(dir.x),abs(dir.y))+dirReduce);',
      ' dir=clamp(dir*rcpDirMin,vec2(-FXAA_SPAN_MAX,FXAA_SPAN_MAX),vec2(FXAA_SPAN_MAX,FXAA_SPAN_MAX))*invRes;',
      ' vec3 rgbA=0.5*(texture2D(tDiffuse,vUv+dir*(1.0/3.0-0.5)).rgb+texture2D(tDiffuse,vUv+dir*(2.0/3.0-0.5)).rgb);',
      ' vec3 rgbB=rgbA*0.5+0.25*(texture2D(tDiffuse,vUv+dir*-0.5).rgb+texture2D(tDiffuse,vUv+dir*0.5).rgb);',
      ' float lB=dot(rgbB,luma);',
      ' if((lB<lMin)||(lB>lMax)) rgbB=rgbA;',
      ' gl_FragColor=vec4(rgbB,1.0);'
    ].join('\n')
  };
}
function bloomShader(){
  return {
    uniforms:{
      tDiffuse:{value:null},
      uStrength:{value:0.55},
      uRadius:{value:0.85},
      uThreshold:{value:0.0},
      uTexel:{value:new THREE.Vector2(1,1)}
    },
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:[
      'uniform sampler2D tDiffuse; uniform float uStrength,uRadius,uThreshold; uniform vec2 uTexel; varying vec2 vUv;',
      'void main(){',
      ' vec4 sum=vec4(0.0);',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(-4.0,-4.0)*uRadius)*0.050;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(-3.0,-3.0)*uRadius)*0.085;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(-2.0,-2.0)*uRadius)*0.140;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(-1.0,-1.0)*uRadius)*0.180;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(0.0,0.0))*0.180;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(1.0,1.0)*uRadius)*0.180;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(2.0,2.0)*uRadius)*0.140;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(3.0,3.0)*uRadius)*0.085;',
      ' sum+=texture2D(tDiffuse,vUv+uTexel*vec2(4.0,4.0)*uRadius)*0.050;',
      ' sum*=0.905;',
      ' vec4 c=texture2D(tDiffuse,vUv);',
      ' float l=dot(c.rgb,vec3(0.2126,0.7152,0.0722));',
      ' float k=smoothstep(uThreshold,uThreshold+0.35,l);',
      ' gl_FragColor=c+sum*uStrength*k;'
    ].join('\n')
  };
}
function gradeShader(){
  return {
    uniforms:{
      tDiffuse:{value:null},
      uTime:{value:0},
      uPulse:{value:0},
      uVignette:{value:0.50},
      uAber:{value:1.15},
      uAspect:{value:1}
    },
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:[
      'uniform sampler2D tDiffuse; uniform float uTime,uPulse,uVignette,uAber,uAspect; varying vec2 vUv;',
      'float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }',
      'vec3 srgb(vec3 c){ return mix(c*12.92, 1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055, step(vec3(0.0031308),c)); }',
      'void main(){',
      ' vec2 c=vUv-0.5;',
      ' float r2=dot(c,c);',
      ' vec2 ca=c*(0.0016*uAber*uAspect);',
      ' vec3 col;',
      ' col.r=texture2D(tDiffuse,vUv+ca).r;',
      ' col.g=texture2D(tDiffuse,vUv).g;',
      ' col.b=texture2D(tDiffuse,vUv-ca).b;',
      ' col*=vec3(1.02,1.005,1.015);',
      ' col+=vec3(0.038,-0.004,0.052)*(1.0-r2*1.4);',
      ' float vig=smoothstep(1.18,0.22,length(c*vec2(1.0,1.12))*1.42);',
      ' col*=mix(1.0,vig,uVignette);',
      ' float g=hash(vUv*vec2(1920.0,1080.0)+fract(uTime)*371.0)-0.5;',
      ' col+=g*0.035*(1.0-vig*0.45);',
      ' col+=vec3(0.42,0.08,0.10)*uPulse*r2*3.2;',
      ' gl_FragColor=vec4(srgb(col),1.0);'
    ].join('\n')
  };
}
function postInit(){
  try{
    post.qs=renderer.getPixelRatio();
    const W=innerWidth*post.qs|0, H=innerHeight*post.qs|0;
    post.rtA=new WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,depthBuffer:true});
    post.rtB=new WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,depthBuffer:false});
    post.rtC=new WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,depthBuffer:false});
    post.rtBloom=new WebGLRenderTarget(W>>2,H>>2,{type:THREE.HalfFloatType,depthBuffer:false});
    post.rtBloom2=new WebGLRenderTarget(W>>2,H>>2,{type:THREE.HalfFloatType,depthBuffer:false});
    post.fxaa=new ShaderMaterial({uniforms:fxaaShader().uniforms,vertexShader:fxaaShader().vertexShader,fragmentShader:fxaaShader().fragmentShader,depthTest:false,depthWrite:false});
    post.fxaa.uniforms.resolution.value.set(W,H);
    post.bloomA=new ShaderMaterial({uniforms:bloomShader().uniforms,vertexShader:bloomShader().vertexShader,fragmentShader:bloomShader().fragmentShader,depthTest:false,depthWrite:false});
    post.bloomB=new ShaderMaterial({uniforms:bloomShader().uniforms,vertexShader:bloomShader().vertexShader,fragmentShader:bloomShader().fragmentShader,depthTest:false,depthWrite:false});
    post.bloomA.uniforms.uTexel.value.set(1/(W>>2),1/(H>>2));
    post.bloomB.uniforms.uTexel.value.set(1/(W>>2),1/(H>>2));
    post.bloomB.uniforms.uStrength.value=0.55;
    post.bloomB.uniforms.uRadius.value=1.25;
    post.bloomB.uniforms.uThreshold.value=-1.0;
    post.grade=new ShaderMaterial({uniforms:gradeShader().uniforms,vertexShader:gradeShader().vertexShader,fragmentShader:gradeShader().fragmentShader,depthTest:false,depthWrite:false});
    post.grade.uniforms.uAspect.value=W/H;
    post.comp=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({transparent:true,depthTest:false,depthWrite:false}));
    post.comp.material.toneMapped=false;
    post.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),post.fxaa);
    post.scene=new THREE.Scene(); post.scene.add(post.quad);
    post.cam=new OrthographicCamera(-1,1,1,-1,0,1);
    post.ready=true;
  }catch(e){ post.ready=false; }
}
function postResize(){
  if(!post.ready) return;
  const W=innerWidth*post.qs|0, H=innerHeight*post.qs|0;
  post.rtA.setSize(W,H); post.rtB.setSize(W,H); post.rtC.setSize(W,H);
  post.rtBloom.setSize(W>>2,H>>2); post.rtBloom2.setSize(W>>2,H>>2);
  post.fxaa.uniforms.resolution.value.set(W,H);
  post.bloomA.uniforms.uTexel.value.set(1/(W>>2),1/(H>>2));
  post.bloomB.uniforms.uTexel.value.set(1/(W>>2),1/(H>>2));
  post.grade.uniforms.uAspect.value=W/H;
}
function blit(mat,target){
  post.quad.material=mat;
  renderer.setRenderTarget(target||null);
  renderer.render(post.scene,post.cam);
}
function postRender(t){
  if(!post.ready){ renderer.setRenderTarget(null); renderer.render(scene,camera); return; }
  /* ambient life: gentle starfield parallax + twinkle + dust drift */
  if(SKY&&SKY.p){
    SKY.p.rotation.y=t*0.004;
    SKY.p.material.opacity=0.72+Math.sin(t*0.9)*0.06+Math.sin(t*2.7)*0.03;
  }
  if(SKY&&SKY.dust){
    SKY.dust.position.y=Math.sin(t*0.05)*6;
    SKY.dust.rotation.y=t*0.010;
    SKY.dust.material.opacity=0.30+Math.sin(t*0.6)*0.07;
  }
  /* render main scene into HDR target */
  renderer.setRenderTarget(post.rtA);
  renderer.render(scene,camera);
  /* FXAA */
  post.fxaa.uniforms.tDiffuse.value=post.rtA.texture;
  blit(post.fxaa,post.rtB);
  /* bloom: tight pass with threshold, then wide cheap pass */
  post.bloomA.uniforms.tDiffuse.value=post.rtB.texture;
  blit(post.bloomA,post.rtBloom);
  post.bloomB.uniforms.tDiffuse.value=post.rtBloom.texture;
  blit(post.bloomB,post.rtBloom2);
  /* copy clean scene into rtC, then additively stack bloom */
  post.comp.material.map=post.rtB.texture;
  post.comp.material.blending=THREE.NoBlending;
  post.comp.material.needsUpdate=true;
  blit(post.comp.material,post.rtC);
  post.comp.material.map=post.rtBloom2.texture;
  post.comp.material.blending=THREE.AdditiveBlending;
  post.comp.material.needsUpdate=true;
  blit(post.comp.material,post.rtC);
  /* final grade: chromatic aberration + lift + vignette + grain -> screen */
  post.grade.uniforms.tDiffuse.value=post.rtC.texture;
  post.grade.uniforms.uTime.value=t;
  post.grade.uniforms.uPulse.value=POST.pulse;
  blit(post.grade,null);
  renderer.setRenderTarget(null);
}
const POST={
  ready:false,
  pulse:0,
  render(t){ postRender(t); },
  resize(){ postResize(); }
};
postInit();
POST.ready=post.ready;

export {THREE,scene,camera,renderer,RED,INDIGO,PLUM,PAPER,COOL,INK,C_RED,C_INDIGO,C_WHITE,C_DIM,SKY,POST,
  bindMats,group3d,add,box,cyl,sph,tor,std,bas,glow,Panel,screenTex,sparkMesh,chevMesh,softSprite,stageBase,backdrop,radialTex,
  standDesk,monitor,student,animStudent,walker,runWalkers,phoneBody,filmCamera,tripod,lightStand,
  clapboard,boomMic,arrowGeo,egyptGeo,egyptOutline,egyptBorder,bldg,pitchedRoof,flagPole,wireGlobe,ringLines,paperFlight,
  roundRect,SANS,SERIF,TAU,clamp,lerp,easeIO,easeOut,easeBack,rnd,dotTex};
