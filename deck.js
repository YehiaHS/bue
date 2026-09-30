import {
  THREE,scene,camera,renderer,RED,INDIGO,PLUM,C_RED,C_INDIGO,C_WHITE,C_DIM,
  add,box,cyl,sph,tor,std,bas,glow,Panel,screenTex,sparkMesh,chevMesh,softSprite,stageBase,
  standDesk,monitor,student,animStudent,walker,runWalkers,phoneBody,filmCamera,tripod,lightStand,
  clapboard,boomMic,arrowGeo,egyptGeo,egyptOutline,egyptBorder,bldg,pitchedRoof,flagPole,wireGlobe,ringLines,paperFlight,backdrop,
  SANS,SERIF,TAU,clamp,lerp,easeIO,easeOut,easeBack,rnd,bindMats,dotTex,POST
} from './core.js';

/* wait for webfonts so canvas panels render with Fraunces/Inter from frame one */
try{
  if(document.fonts&&document.fonts.ready) await document.fonts.ready;
}catch(e){}

const RING=262, STEP=0.66;
const SLIDES=[];
let cur=0, from=0, to=0, tr=1;

function slide(def,index){
  const a=index*STEP;
  const h={g:new THREE.Group(),mats:[]};
  bindMats(h.mats);
  def.build(h);
  bindMats(null);
  h.g.position.set(Math.sin(a)*RING,0,Math.cos(a)*RING);
  h.g.rotation.y=a;
  scene.add(h.g);
  SLIDES.push({def,h,g:h.g,index,angle:a,pos:h.g.position.clone(),local:0});
}

const elKick=document.getElementById('kick');
const elH1=document.getElementById('h1');
const elHp=document.getElementById('hp');
const elNum=document.getElementById('num');
const elProg=document.querySelector('#prog i');
const elNav=document.getElementById('nav');

function camFor(i){
  const c=SLIDES[i].def.cam||{d:96,h:31,y:14};
  const a=SLIDES[i].angle, p=SLIDES[i].pos;
  return {
    p:new THREE.Vector3(p.x+Math.sin(a)*c.d, c.h, p.z+Math.cos(a)*c.d),
    l:new THREE.Vector3(p.x, c.y, p.z)
  };
}
function setFade(sl,f){
  const ms=sl.h.mats;
  for(let i=0;i<ms.length;i++){
    const m=ms[i];
    const b=(m.userData.base===undefined?1:m.userData.base);
    m.opacity=b*f;
    m.transparent=(m.opacity<0.999)||(m.userData.alwaysT===true);
  }
}

const scrEdit=(accent)=>screenTex(320,200,(c,w,H)=>{
  c.fillStyle='#0B0E18'; c.fillRect(0,0,w,H);
  c.fillStyle=accent; c.fillRect(0,0,w,26);
  c.fillStyle='#0A0C14'; c.fillRect(8,34,w-16,58);
  c.fillStyle='#1A2033';
  for(let i=0;i<7;i++) c.fillRect(12,40+i*7,60+((i*47)%180),4);
  c.fillStyle=accent; c.fillRect(w-74,H-52,62,42);
  c.fillStyle='#0A0C14'; c.fillRect(w-70,H-48,54,34);
  c.fillStyle='#CFD9DF'; c.font='700 15px '+SANS; c.fillText('BUE FCMM',14,22);
  c.fillStyle='#8E97AF'; c.font='400 12px '+SANS; c.fillText('LIVE',w-38,22);
}).t;
const AD_TEX=screenTex(320,400,(c,w,H)=>{
  const gr=c.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'#2B3C92'); gr.addColorStop(0.55,'#ED1F2C'); gr.addColorStop(1,'#12142B');
  c.fillStyle=gr; c.fillRect(0,0,w,H);
  c.fillStyle='rgba(255,255,255,0.14)';
  c.beginPath(); c.arc(w*0.72,H*0.30,88,0,TAU); c.fill();
  c.fillStyle='#fff'; c.font='800 40px '+SANS;
  c.fillText('LEARN',24,96); c.fillText('HOW TO',24,140); c.fillText('THINK',24,184);
  c.font='400 15px '+SANS; c.fillText('BUE · MASS COMMUNICATION',24,H-30);
}).t;
const REEL_TEX=(ph)=>screenTex(300,540,(c,w,H)=>{
  c.fillStyle='#0A0C12'; c.fillRect(0,0,w,H);
  const gr=c.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'#3B1060'); gr.addColorStop(1,'#0E2A6B');
  c.fillStyle=gr; c.fillRect(0,60,w,H-120);
  c.fillStyle='rgba(0,0,0,0.32)'; c.fillRect(0,60,w,H-120);
  c.textAlign='center';
  const st=[['THE FIRST 3 SECONDS','STOP THE SCROLL'],['CASE BREAKDOWN','SHOW THE WORK'],['CALL TO ACTION','DO IT NOW']][ph];
  c.fillStyle='#fff'; c.font='700 29px '+SANS; c.fillText(st[0],w/2,H*0.40);
  c.font='400 18px '+SANS; c.fillStyle='rgba(255,255,255,0.85)'; c.fillText(st[1],w/2,H*0.47);
  c.textAlign='left';
  c.fillStyle='#fff'; c.font='700 16px '+SANS; c.fillText('@bue.fcmm',14,30);
  c.fillStyle='#0A0C12'; c.fillRect(0,H-92,w,92);
  c.font='400 14px '+SANS; c.fillText('60 SECOND LESSON  ·  MEDIA STUDIES',14,H-62);
  c.fillStyle='#2A3040'; c.fillRect(14,H-46,272,6);
  c.fillStyle='#ED1F2C'; c.fillRect(14,H-46,272*(ph*0.33+0.06),6);
}).t;
const PR_TEX=screenTex(260,340,(c,w,H)=>{
  c.fillStyle='#F4F1EA'; c.fillRect(0,0,w,H);
  c.fillStyle='#ED1F2C'; c.fillRect(0,0,w,44);
  c.fillStyle='#fff'; c.font='700 20px '+SANS; c.fillText('PRESS RELEASE',16,30);
  c.fillStyle='#2A2A2E';
  for(let i=0;i<9;i++) c.fillRect(16,70+i*22,180-((i*53)%110),5);
  c.fillStyle='#8E8A82'; c.fillRect(16,H-40,120,5);
}).t;
const YT_TEX=screenTex(300,170,(c,w,H)=>{
  c.clearRect(0,0,w,H);
  c.fillStyle='#ED1F2C';
  c.beginPath();
  c.moveTo(140,26);
  c.quadraticCurveTo(150,46,164,74);
  c.quadraticCurveTo(150,58,150,96);
  c.quadraticCurveTo(150,58,136,74);
  c.quadraticCurveTo(150,46,140,26);
  c.closePath(); c.fill();
  c.fillStyle='#fff'; c.font='800 52px '+SANS; c.textAlign='center';
  c.fillText('BUE',190,150);
  c.textAlign='left';
}).t;
const POST_TEX=screenTex(220,300,(c,w,H)=>{
  const gr=c.createLinearGradient(0,0,0,H);
  gr.addColorStop(0,'#2B3C92'); gr.addColorStop(1,'#0B0E18');
  c.fillStyle=gr; c.fillRect(0,0,w,H);
  c.fillStyle='#ED1F2C'; c.fillRect(0,0,w,26);
  c.fillStyle='#fff'; c.font='700 15px '+SANS; c.fillText('BUE FCMM',12,19);
  c.fillStyle='#39406B'; c.fillRect(0,H-52,w,52);
  c.fillStyle='#CFD9DF'; c.fillRect(12,H-38,120,5);
  c.fillStyle='#57607A'; c.fillRect(12,H-26,180,4);
}).t;

/* ---------------------------- 00 HERO ---------------------------- */
slide({
  kick:C_RED, h1:'Mass Communication runs the outlet',
  hp:'Student work, published under the faculty name.',
  cam:{d:74,h:24,y:16},
  build(h){
    const g=h.g;
    g.add(stageBase(32,0x6E7FD8));

    const shaft=std({color:0x161C31,roughness:.42,metalness:.55});
    const cap=std({color:0x2C3A6E,roughness:.3,metalness:.75,emissive:0x1B2A5E,emissiveIntensity:.7});
    const strip=glow({color:0x9FB2FF,opacity:0.5});
    const pylon=new THREE.Group();

    cyl(pylon,7.4,8.6,1.1,40,std({color:0x1C2340,roughness:.6,metalness:.4}),0,0.55,0);
    cyl(pylon,6.0,7.0,0.8,40,cap,0,1.5,0);
    cyl(pylon,3.1,4.4,22,32,shaft,0,12.9,0);
    cyl(pylon,2.4,3.1,1.2,32,cap,0,24.4,0);
    cyl(pylon,1.5,2.4,3.4,28,cap,0,26.6,0);
    for(let i=0;i<8;i++){
      const a=i*TAU/8;
      box(pylon,0.22,21,0.22,strip,Math.cos(a)*3.0,13,Math.sin(a)*3.0);
    }
    for(const yy of [4.2,9.0,13.8,18.6,22.6]){
      const r2=tor(pylon,3.5,0.10,glow({color:0x5F72C8,opacity:0.45}),0,yy,0,5,44);
      r2.rotation.x=Math.PI/2;
    }
    g.add(pylon);

    const sp=sparkMesh(5.4,RED,RED);
    sp.position.set(0,15.5,3.6);
    g.add(sp);
    h.spark=sp;
    const halo=softSprite(RED,30,0.30); halo.position.set(0,15.5,3.0); g.add(halo);
    h.halo=halo;
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.5,4.0,12,24,1,true),glow({color:RED,opacity:0.12}));
    beam.position.set(0,23.5,0);
    g.add(beam);
    h.beam=beam;

    const orb=new THREE.Group();
    const o1=tor(orb,11.5,0.12,glow({color:INDIGO,opacity:0.55}),0,0,0,6,110);
    o1.rotation.x=Math.PI/2+0.30; o1.rotation.z=0.14;
    const o2=tor(orb,13.8,0.08,glow({color:RED,opacity:0.38}),0,0,0,6,110);
    o2.rotation.x=Math.PI/2-0.42; o2.rotation.z=-0.24;
    for(let i=0;i<3;i++){
      const d=sph(orb,0.34,glow({color:i%2?RED:0x9FB2FF,opacity:0.95}),0,0,0,10,8);
      d.userData.orb=i;
    }
    orb.position.set(0,15.5,0);
    g.add(orb);
    h.orb=orb;

    for(let i=0;i<14;i++) walker(g,{r:20+i*0.42,speed:3.1+i*0.10,shirt:i%4?0x2B3C92:RED,ph:rnd(0,TAU),y0:0.14});
    for(let i=0;i<9;i++) walker(g,{r:11.4,speed:4.4,shirt:0x39406B,ph:rnd(0,TAU),y0:0.14});

    const p=new Panel(26,8.6,{accent:C_RED,bg:'rgba(6,7,14,0.82)'});
    p.set([
      {t:'THE BRITISH UNIVERSITY IN EGYPT',s:0.58,w:700,c:C_RED,a:'center'},
      {t:'Faculty of Communication and Mass Media',s:1.12,w:600,c:C_WHITE,sp:0.24,a:'center'},
      {t:'Proposal to the Dean  ·  El Sherouk, Cairo',s:0.74,w:400,c:C_DIM,sp:0.24,a:'center'}
    ],{top:true});
    p.at(g,0,30.5,10);
    h.title=p.mesh;
  },
  update(h,l,t){
    h.spark.rotation.z=t*0.20;
    h.spark.scale.setScalar(1+Math.sin(t*1.5)*0.03);
    h.halo.material.opacity=0.26+Math.sin(t*1.5)*0.08;
    h.beam.material.userData.base=0.10+0.05*Math.sin(t*1.6);
    h.beam.material.opacity=h.beam.material.userData.base;
    h.orb.rotation.y=t*0.30;
    h.orb.children.forEach(c=>{
      if(c.userData.orb===undefined) return;
      const a=t*0.55+c.userData.orb*TAU/3;
      c.position.set(Math.cos(a)*11.5,Math.sin(a*1.4)*2.2,Math.sin(a)*11.5);
    });
    h.title.position.y=30.5+Math.sin(t*0.6)*0.45;
    /* shooting-star comet skimming past the pylon */
    if(!h.comet){
      const cnv=document.createElement('canvas'); cnv.width=256; cnv.height=64;
      const cg=cnv.getContext('2d');
      const cgGrad=cg.createLinearGradient(0,32,256,32);
      cgGrad.addColorStop(0,'rgba(255,255,255,0)');
      cgGrad.addColorStop(0.72,'rgba(159,178,232,0.55)');
      cgGrad.addColorStop(1,'rgba(255,244,238,1)');
      cg.fillStyle=cgGrad; cg.fillRect(0,28,256,8);
      const ctex=new THREE.CanvasTexture(cnv); ctex.colorSpace=THREE.SRGBColorSpace;
      h.comet=new THREE.Mesh(new THREE.PlaneGeometry(30,4.6),new THREE.MeshBasicMaterial({map:ctex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
      h.comet.material.userData.base=1.0;
      h.comet.material.userData.alwaysT=true;
      h.mats.push(h.comet.material);
      g.add(h.comet);
    }
    {
      const cy=(t*0.085)%1;
      h.comet.position.set(-95+cy*160,34-cy*22,-38+cy*8);
      h.comet.lookAt(camera.position);
      h.comet.material.opacity=0.9*Math.sin(cy*Math.PI);
    }
    runWalkers(h.g,t);
  }
},0);

/* -------------------- 01 THE MODEL / BUCKET -------------------- */
slide({
  kick:C_RED, h1:'Coursework goes out as published work',
  hp:'Five pathways share one newsroom. Anything that clears the desk gets a faculty byline and a publish date.',
  cam:{d:88,h:30,y:13},
  build(h){
    const g=h.g;
    g.add(stageBase(46));
    const stations=[
      {k:'edit',a:-0.96,lab:'EDIT',col:C_INDIGO},
      {k:'shoot',a:-0.48,lab:'SHOOT',col:'#5FD08A'},
      {k:'write',a:0,lab:'WRITE',col:'#C77BC0'},
      {k:'publish',a:0.48,lab:'PUBLISH',col:C_RED},
      {k:'ad',a:0.96,lab:'ADVERTISE',col:'#E7B84B'}
    ];
    const SR=27;
    const stu=[];
    const papers=[];

    stations.forEach((s,i)=>{
      const grp=new THREE.Group();
      grp.position.set(Math.sin(s.a)*SR,0,Math.cos(s.a)*SR);
      grp.rotation.y=s.a;
      g.add(grp);
      const lab=new Panel(9,2.5,{bg:'rgba(6,7,14,0.84)',border:'rgba(255,255,255,0.12)'});
      lab.set([{t:s.lab,s:0.95,w:700,c:s.col,a:'center'}]);
      lab.mesh.rotation.y=-s.a;
      lab.at(grp,0,15.0,0);
      cyl(grp,0.09,0.11,9.2,8,std({color:0x2A3040,metalness:.6}),0,4.6,-0.9);
      s.panel=lab.mesh; s.grp=grp;

      if(s.k==='edit'){
        const dm=std({color:0x1E2333,roughness:.6,metalness:.3});
        standDesk(grp,7.2,2.6,2.6,dm,std({color:0x39406B,roughness:.5,metalness:.4}));
        monitor(grp,2.5,1.6,scrEdit('#2B3C92'),-1.7,3.7,-0.9,0.16);
        monitor(grp,2.5,1.6,scrEdit('#5FD08A'),1.7,3.7,-0.9,-0.16);
        for(let k=0;k<2;k++){
          const st=student({shirt:k?0x2B3C92:0x39406B});
          st.position.set(k?1.9:-1.9,0,1.4);
          grp.add(st); stu.push({s:st,m:'type',ph:rnd(0,TAU)});
        }
      } else if(s.k==='shoot'){
        box(grp,12,7,0.25,std({color:0x1E7A45,roughness:.95,emissive:0x0E3D22,emissiveIntensity:.5}),0,3.5,-1.6);
        const gc=softSprite(0x2E9E5C,18,0.18); gc.position.set(0,3.5,-1.2); grp.add(gc);
        const cam=filmCamera(grp,0.85); cam.position.set(-1.2,2.0,3.0); cam.rotation.y=0.5;
        const tri=tripod(grp,2.0,0.85); tri.position.set(-1.2,0,3.0);
        const ls1=lightStand(grp,7.4,0xFFD9A0); ls1.position.set(4.8,0,2.0); ls1.rotation.y=-0.7;
        const ls2=lightStand(grp,6.4,0xBFD8FF); ls2.position.set(-5.4,0,1.0); ls2.rotation.y=0.8;
        const bm=boomMic(grp,0.9); bm.position.set(0,7.0,0.4);
        const pres=student({shirt:0x8E3A32,skin:0xD9A57E});
        pres.position.set(1.2,0,0.2); pres.rotation.y=Math.PI+0.3; grp.add(pres);
        stu.push({s:pres,m:'present',ph:0});
        const op=student({shirt:0x2A2F44,skin:0x7A5236});
        op.position.set(-1.5,0,4.4); op.rotation.y=Math.PI-0.6; grp.add(op);
        stu.push({s:op,m:'shoot',ph:1});
        const a2=student({shirt:0x39406B,skin:0xE0B48C});
        a2.position.set(5.2,0,3.2); a2.rotation.y=-0.8; grp.add(a2);
        stu.push({s:a2,m:'stand',ph:2});
      } else if(s.k==='write'){
        const dm=std({color:0x1E2333,roughness:.6,metalness:.3});
        standDesk(grp,6.4,2.4,2.6,dm,std({color:0x4A3350,roughness:.5,metalness:.4}));
        monitor(grp,2.2,1.4,PR_TEX,0,3.7,-0.7,0);
        for(let k=0;k<3;k++){
          const st=student({shirt:k===1?0x6B2E5E:0x4A3350,skin:[0xC08A63,0x8A5C3B,0xD9A57E][k]});
          st.position.set(-2.0+k*2.0,0,1.3);
          st.rotation.y=Math.PI;
          grp.add(st); stu.push({s:st,m:'type',ph:rnd(0,TAU)});
        }
        for(let k=0;k<5;k++) papers.push({m:paperFlight(grp,PR_TEX,0.6),grp,ph:k*1.256});
      } else if(s.k==='publish'){
        cyl(grp,3.0,3.4,1.2,32,std({color:0x141828,roughness:.6,metalness:.3}),0,0.6,0);
        const ph=phoneBody(grp,3.6,7.4,REEL_TEX(1),0,5.6,0.2);
        ph.rotation.y=-0.18;
        s.phone=ph;
        const gl=softSprite(RED,15,0.24); gl.position.set(0,5.6,0.8); grp.add(gl);
        for(let k=0;k<2;k++){
          const st=student({shirt:k?0xED1F2C:0x8E3A32,skin:0xC08A63});
          st.position.set(k?2.7:-2.7,0,2.0);
          st.rotation.y=Math.PI-0.3;
          grp.add(st); stu.push({s:st,m:'work',ph:rnd(0,TAU)});
        }
        for(let k=0;k<4;k++){
          const c=box(grp,1.1,1.7,0.05,bas({map:POST_TEX}),0,0,0);
          s.cards=s.cards||[]; s.cards.push(c);
        }
      } else {
        box(grp,1.0,4.6,1.0,std({color:0x2A2F44,metalness:.5}),-2.6,2.3,0);
        const fr=new THREE.Group(); fr.position.set(0,4.6,0); fr.rotation.x=-0.16;
        box(fr,5.4,6.6,0.3,std({color:0x2A2F44,roughness:.7}),0,0,0);
        box(fr,4.8,6.0,0.1,bas({map:AD_TEX}),0,0,0.2);
        grp.add(fr);
        s.poster=fr;
        const st=student({shirt:0xB07A1E,skin:0xE0B48C});
        st.position.set(1.5,0,1.9); st.rotation.y=Math.PI+0.4; grp.add(st);
        stu.push({s:st,m:'work',ph:rnd(0,TAU)});
        const st2=student({shirt:0x5C4A22,skin:0x8A5C3B});
        st2.position.set(-1.1,0,2.2); st2.rotation.y=Math.PI-0.2; grp.add(st2);
        stu.push({s:st2,m:'stand',ph:1.4});
      }
    });
    h.stations=stations; h.stu=stu; h.papers=papers;

    const bk=new THREE.Group();
    bk.position.set(0,0,0);
    cyl(bk,6.4,4.2,7.0,48,std({color:0x36456B,roughness:.45,metalness:.45,side:THREE.DoubleSide,emissive:0x121A33,emissiveIntensity:.5}),0,3.5,0);
    cyl(bk,4.2,4.2,0.5,48,std({color:0x1D2438,roughness:.6}),0,0.25,0);
    const rim=tor(bk,6.4,0.30,glow({color:RED,opacity:0.65}),0,7.0,0,8,64);
    rim.rotation.x=Math.PI/2;
    const rim2=tor(bk,6.3,0.14,glow({color:0x9FB4FF,opacity:0.45}),0,2.8,0,6,64);
    rim2.rotation.x=Math.PI/2;
    const inr=softSprite(RED,28,0.24); inr.position.set(0,3.5,0); bk.add(inr);
    g.add(bk);
    h.bucket=bk; h.rim=rim; h.inner=inr;

    const props=[];
    [{kind:'yt'},{kind:'phone'},{kind:'clap'},{kind:'cam'},{kind:'doc'}].forEach((ps,i)=>{
      const p=new THREE.Group();
      if(ps.kind==='yt'){
        box(p,8.9,5.2,0.4,bas({map:YT_TEX}),0,0,0);
        box(p,9.3,5.6,0.3,std({color:0x14161E,roughness:.4,metalness:.5}),0,0,-0.2);
      } else if(ps.kind==='phone'){
        const t=screenTex(200,380,(c,w,H)=>{
          const gr=c.createLinearGradient(0,0,0,H);
          gr.addColorStop(0,'#ED1F2C'); gr.addColorStop(1,'#2B3C92');
          c.fillStyle=gr; c.fillRect(0,0,w,H);
          c.textAlign='center';
          c.fillStyle='#fff'; c.font='800 34px '+SANS; c.fillText('BUE',w/2,H*0.5);
          c.font='400 14px '+SANS; c.fillText('FCMM',w/2,H*0.5+28);
          c.textAlign='left';
        }).t;
        phoneBody(p,2.1,4.0,t);
      } else if(ps.kind==='clap'){ clapboard(p,1.3); }
      else if(ps.kind==='cam'){ filmCamera(p,0.7); }
      else { box(p,2.0,2.6,0.2,bas({map:PR_TEX}),0,0,0); }
      p.position.set(rnd(-3,3),52+i*4,0);
      p.rotation.set(rnd(0,TAU),rnd(0,TAU),rnd(0,TAU));
      g.add(p);
      props.push({p,i,landY:2.2+(i%2)*1.0});
    });
    h.props=props;

    const tower=new THREE.Group();
    tower.position.set(0,0,0);
    tower.scale.setScalar(0.0001);
    bldg(tower,11,26,11,{brick:0x7E342D,stone:0xDCD3C4});
    pitchedRoof(tower,11.4,3.4,11.4,0x2E2A26);
    const sp=sparkMesh(3.4,RED,RED); sp.position.set(0,19,5.7); tower.add(sp);
    const sp2=sparkMesh(1.7,0xF2F5FA,0xF2F5FA); sp2.position.set(0,8.6,5.7); tower.add(sp2);
    const fl=flagPole(tower,24); fl.position.set(5.8,0,4.6);
    g.add(tower);
    h.tower=tower; h.towerSpark=sp;

    const fin=new Panel(26,7.0,{bg:'rgba(237,31,44,0.94)',border:'rgba(255,255,255,0.35)'});
    fin.set([
      {t:'BUE FCMM',s:1.5,w:800,c:'#fff',a:'center'},
      {t:'A student-run media outlet',s:0.86,w:500,c:'#FFE3E5',sp:0.16,a:'center'}
    ]);
    fin.at(g,0,34,6);
    h.final=fin.mesh;

    const p=new Panel(28,16,{accent:C_RED});
    p.set([
      {t:'THE FIVE PATHWAYS',s:0.66,w:700,c:C_RED},
      {t:'Content creation',s:1.0,w:600,c:C_WHITE,sp:0.34},
      {t:'Social and paid social',s:1.0,w:600,c:C_WHITE,sp:0.13},
      {t:'Brand communication and PR',s:1.0,w:600,c:C_WHITE,sp:0.13},
      {t:'Digital marketing',s:1.0,w:600,c:C_WHITE,sp:0.13},
      {t:'Broadcast, film and narrative',s:1.0,w:600,c:C_WHITE,sp:0.13},
      {t:'One newsroom. One desk. One byline.',s:0.88,w:500,c:C_DIM,sp:0.40}
    ]);
    p.at(g,-40,20,-14);
  },
  update(h,l,t,dt){
    runWalkers(h.g,t);
    for(const s of h.stu) animStudent(s.s,t+s.ph,s.m);
    h.stations.forEach((s,i)=>{
      s.panel.position.y=15.0+Math.sin(t*1.1+i*0.9)*0.16;
      if(s.poster) s.poster.rotation.y=Math.sin(t*0.35+i)*0.10;
      if(s.cards) s.cards.forEach((c,k)=>{
        const a=t*0.55+k*0.78;
        c.position.set(Math.cos(a)*4.6,4.0+Math.sin(a*1.4+k)*1.6,Math.sin(a)*3.4+1.4);
        c.rotation.set(a,a*0.7,0);
      });
      if(s.phone) s.phone.rotation.z=Math.sin(t*0.9)*0.03;
    });
    h.papers.forEach(pp=>{
      const a=t*0.7+pp.ph;
      pp.m.position.set(Math.cos(a)*2.6,4.2+Math.sin(a*1.3+pp.ph)*0.9,Math.sin(a)*2.2+1.3);
      pp.m.rotation.set(a*0.8,a*1.2,a*0.5);
    });
    h.props.forEach(pr=>{
      const d0=1.1+pr.i*0.85;
      const u=clamp((l-d0)/2.1,0,1);
      const e=1-Math.pow(1-u,3);
      pr.p.position.y=lerp(52+pr.i*4,pr.landY,e);
      if(u<1){
        pr.p.rotation.x+=dt*3.1; pr.p.rotation.y+=dt*2.2; pr.p.rotation.z+=dt*1.4;
        pr.p.scale.setScalar(lerp(0.4,1,u));
      } else {
        pr.p.position.y=pr.landY+Math.sin(t*1.6+pr.i)*0.18;
        pr.p.rotation.y+=dt*(0.5+pr.i*0.16);
        pr.p.scale.setScalar(1);
      }
    });
    const grow=clamp((l-6.2)/2.4,0,1);
    const s=lerp(1,1.55,easeOut(grow));
    h.bucket.scale.set(s,s,s);
    h.rim.material.userData.base=0.65+0.30*Math.sin(t*2.4)*grow;
    h.rim.material.opacity=h.rim.material.userData.base;
    h.inner.material.opacity=0.24+0.22*grow;
    const up=clamp((l-8.4)/2.4,0,1);
    h.tower.scale.setScalar(up<=0?0.0001:easeBack(up));
    h.towerSpark.rotation.z=t*0.5;
    const fa=clamp((l-9.6)/1.6,0,1);
    h.final.material.opacity=fa;
    h.final.material.transparent=fa<0.999;
    h.final.position.y=34+Math.sin(t*0.8)*0.4;
  }
},1);

/* ---------------------- 02 CASE 01 ANNENBERG ---------------------- */
slide({
  kick:'CASE 01 · USC ANNENBERG, LOS ANGELES',
  h1:'One newsroom, 2,300 students, around the clock',
  hp:'TV, audio, digital and social desks share one editorial room. Seniors run the morning meeting. Strong work ships the same day.',
  cam:{d:92,h:30,y:14},
  build(h){
    const g=h.g;
    g.add(stageBase(48));
    const tile=POST_TEX;
    const bld=new THREE.Group();
    bld.position.set(-6,0,0);
    const frame=std({color:0x1A1F2E,roughness:.7,metalness:.2});
    const glass=std({color:0x2C3C6E,roughness:.1,metalness:.5,transparent:true,opacity:.14,emissive:0x1B2E63,emissiveIntensity:.9});
    const strip=glow({color:0xC8D6FF,opacity:0.42});
    const floorLit=std({color:0x232C46,roughness:.6,metalness:.3,emissive:0x1A2450,emissiveIntensity:.6});
    for(let f=0;f<3;f++){
      const y=1.6+f*8.2;
      box(bld,30,0.5,18,floorLit,0,y-0.3,0);
      box(bld,30,0.4,18,frame,0,y+7.9,0);
      box(bld,27,0.16,15,strip,0,y+7.55,0);
      for(let c=-2;c<=2;c++){ box(bld,0.45,8.0,0.45,frame,c*7,y+3.8,8.6); box(bld,0.45,8.0,0.45,frame,c*7,y+3.8,-8.6); }
      for(let c=-2;c<=2;c++){ box(bld,0.4,8.0,0.4,frame,-14.8,y+3.8,c*4.3); box(bld,0.4,8.0,0.4,frame,14.8,y+3.8,c*4.3); }
      for(let c=-2;c<=2;c++) for(let d=-2;d<=2;d++) box(bld,6.4,7.4,0.12,glass,c*7+3.4,y+3.8,d*4.3+2.1);
    }
    for(let f=0;f<3;f++){
      const lgt=softSprite(0x8FA8FF,20,0.16);
      lgt.position.set(0,1.6+f*8.2+2.6,6);
      bld.add(lgt);
    }
    g.add(bld);
    h.bld=bld;

    const stu=[];
    for(let f=0;f<2;f++){
      const y=f*8.2;
      for(let i=0;i<5;i++){
        const x=-12+i*6;
        const desk=new THREE.Group(); desk.position.set(x,y,-1.5);
        standDesk(desk,4.2,1.6,2.5,std({color:0x1E2333,roughness:.6,metalness:.3}),std({color:0x39406B,roughness:.5,metalness:.4}));
        g.add(desk);
        monitor(desk,1.9,1.2,tile,0,3.6,-0.5,0);
        const st=student({shirt:(i+f)%2?0x2B3C92:0x8E3A32,skin:[0xC08A63,0x8A5C3B,0xD9A57E,0x6B4530,0xE0B48C][i]});
        st.position.set(0,y,0.6); st.rotation.y=Math.PI;
        g.add(st); stu.push({s:st,m:'type',ph:rnd(0,TAU)});
      }
    }
    h.stu=stu;

    const wall=new Panel(26,9.4,{bg:'rgba(6,7,14,0.86)'});
    wall.set([
      {t:'NEWSROOM · LIVE',s:0.62,w:700,c:C_RED},
      {t:'Assignment  ·  desk  ·  publish',s:1.25,w:600,c:C_WHITE,sp:0.30},
      {t:'TV   ·   audio   ·   digital   ·   social',s:0.86,w:500,c:C_INDIGO,sp:0.26}
    ]);
    wall.at(g,-7,33,20);
    h.wall=wall.mesh;

    const clockTex=screenTex(360,360,(c,w,H)=>{
      c.clearRect(0,0,w,H);
      c.strokeStyle='rgba(207,217,223,0.30)'; c.lineWidth=3;
      c.beginPath(); c.arc(180,180,164,0,TAU); c.stroke();
      for(let i=0;i<24;i++){
        const a=i*TAU/24-Math.PI/2, big=i%6===0;
        c.strokeStyle=big?'#ED1F2C':'rgba(207,217,223,0.55)';
        c.lineWidth=big?7:3;
        c.beginPath();
        c.moveTo(180+Math.cos(a)*(big?128:140),180+Math.sin(a)*(big?128:140));
        c.lineTo(180+Math.cos(a)*152,180+Math.sin(a)*152);
        c.stroke();
      }
      c.fillStyle='#CFD9DF'; c.font='700 46px '+SANS; c.textAlign='center';
      c.fillText('24/7',180,300); c.textAlign='left';
    }).t;
    const clockG=new THREE.Group();
    clockG.position.set(38,19,8);
    add(clockG,new THREE.CircleGeometry(7.6,48),bas({map:clockTex}));
    const hr=new THREE.Group(), mr=new THREE.Group();
    box(hr,0.5,5.2,0.12,glow({color:C_RED,opacity:0.95}),0,2.4,0.2);
    box(mr,0.32,7.4,0.12,glow({color:0xF2F5FA,opacity:0.90}),0,3.5,0.3);
    clockG.add(hr,mr);
    g.add(clockG);
    h.hourHand=hr; h.minHand=mr;

    const chips=[];
    ['ASSIGNMENT','DESK','PUBLISHED'].forEach((c,i)=>{
      const p=new Panel(11,3.0,{bg:'rgba(8,10,18,0.88)',border:'rgba(237,31,44,0.5)'});
      p.set([{t:c,s:0.92,w:700,c:i===2?C_RED:C_WHITE,a:'center'}]);
      p.at(g,24,3.0+i*5.2,12);
      chips.push(p.mesh);
      if(i<2){
        const a=arrowGeo(2.6,i===0?C_INDIGO:C_RED);
        a.position.set(30.2,5.6+i*5.2,12);
        a.rotation.z=-Math.PI/2;
        g.add(a);
      }
    });
    h.chips=chips;

    const p=new Panel(28,15,{accent:C_INDIGO});
    p.set([
      {t:'WHAT WE ADOPT',s:0.66,w:700,c:C_INDIGO},
      {t:'2,300 students in one editorial room',s:1.0,w:600,c:C_WHITE,sp:0.34},
      {t:'Student desks lead morning editorial meetings',s:0.96,w:600,c:C_WHITE,sp:0.14},
      {t:'Cross-cohort peer review across pathways',s:0.96,w:600,c:C_WHITE,sp:0.14},
      {t:'Vetted student reporting ships daily',s:0.96,w:600,c:C_WHITE,sp:0.14},
      {t:'Model: one newsroom, five pathways, students running the desk.',s:0.86,w:500,c:C_DIM,sp:0.40}
    ]);
    p.at(g,-44,19,-8);
  },
  update(h,l,t){
    h.hourHand.rotation.z=-t*0.9;
    h.minHand.rotation.z=-t*7.4;
    h.wall.position.y=33+Math.sin(t*0.6)*0.28;
    h.chips.forEach((c,i)=>{ c.position.y=3.0+i*5.2+Math.sin(t*1.1+i*0.8)*0.22; });
    for(const s of h.stu) animStudent(s.s,t+s.ph,s.m);
    h.bld.position.y=Math.sin(t*0.4)*0.15;
  }
},2);

/* ------------------- 03 CASE 02 POLIS OBSERVATORY ------------------- */
slide({
  kick:'CASE 02 · LSE LONDON, POLIS',
  h1:'Research with a publication date',
  hp:'POLIS pairs academic work with newsroom practice. It publishes on digital ethics, algorithms and press regulation, and works with the BBC, Reuters and Ofcom.',
  cam:{d:86,h:27,y:14},
  build(h){
    const g=h.g;
    g.add(stageBase(44));
    const stone=std({color:0xDCD3C4,roughness:.86});
    const stone2=std({color:0xC4BAAA,roughness:.88});
    const glass=std({color:0x2C3C6E,roughness:.12,metalness:.6,emissive:0x16264E,emissiveIntensity:.7});
    const b=new THREE.Group();
    bldg(b,30,13,16,{brick:0x8A3830,stone:0xDCD3C4,glass:0x2C3C6E});
    box(b,32,1.4,18,stone,0,0.7,0);
    for(let i=0;i<8;i++){ cyl(b,0.95,1.05,11,18,stone2,-13+i*3.7,7,8.4); cyl(b,0.95,1.05,11,18,stone2,-13+i*3.7,7,-8.4); }
    box(b,33,2.0,19.5,stone,0,13.6,0);
    const ps=new THREE.Shape();
    ps.moveTo(-16.5,0); ps.lineTo(16.5,0); ps.lineTo(0,5.4); ps.closePath();
    const ped=add(b,new THREE.ExtrudeGeometry(ps,{depth:1.0,bevelEnabled:false}),stone,0,14.6,9.2);
    ped.geometry.translate(0,0,-0.5);
    box(b,26,9,0.3,glass,0,7.6,8.55);
    g.add(b);
    h.bld=b;

    const brf=screenTex(300,190,(c,w,H)=>{
      c.fillStyle='#0A0C14'; c.fillRect(0,0,w,H);
      c.fillStyle='#ED1F2C'; c.fillRect(0,0,w,8);
      c.fillStyle='#F2F5FA'; c.font='700 21px '+SANS; c.fillText('DAILY BRIEF',16,42);
      c.fillStyle='#98A0B8'; c.font='400 13px '+SANS; c.fillText('Global Media Observatory',16,64);
      c.fillStyle='#2A3040';
      for(let i=0;i<6;i++) c.fillRect(16,84+i*17,240-((i*61)%130),5);
    }).t;
    const rep=screenTex(300,190,(c,w,H)=>{
      c.fillStyle='#F4F1EA'; c.fillRect(0,0,w,H);
      c.fillStyle='#2B3C92'; c.fillRect(0,0,w,8);
      c.fillStyle='#1A1A1E'; c.font='700 19px '+SANS; c.fillText('QUARTERLY',16,42); c.fillText('REPORT',16,66);
      c.fillStyle='#8A8A90';
      for(let i=0;i<5;i++) c.fillRect(16,92+i*17,220-((i*47)%110),5);
    }).t;
    h.sheets=[];
    for(let i=0;i<6;i++) h.sheets.push(paperFlight(g,i%2?brf:rep,1.5));

    const rings=new THREE.Group();
    rings.position.set(0,20,0);
    const r1=tor(rings,26,0.16,glow({color:INDIGO,opacity:0.42}),0,0,0,6,140);
    const r2=tor(rings,30,0.11,glow({color:RED,opacity:0.30}),0,0,0,6,140);
    r1.rotation.x=Math.PI/2+0.22; r1.rotation.z=0.16;
    r2.rotation.x=Math.PI/2-0.30; r2.rotation.z=-0.22;
    g.add(rings);
    h.r1=r1; h.r2=r2;

    const gl=new THREE.Group();
    gl.position.set(30,20,-6);
    add(gl,new THREE.SphereGeometry(7.2,32,24),std({color:0x152A5C,roughness:.3,metalness:.4,emissive:0x1B3A80,emissiveIntensity:.5}));
    wireGlobe(gl,7.35,0x8FA0E8,0.34);
    ringLines(gl,9.4,0x8FA0E8,0.26,2);
    h.sats=[];
    for(let i=0;i<4;i++){ const s=softSprite(0xED1F2C,3.4,0.9); gl.add(s); h.sats.push(s); }
    g.add(gl);
    h.gl=gl;

    h.stu=[];
    for(let i=0;i<4;i++){
      const s=student({shirt:i%2?0x2B3C92:0x8E3A32,skin:[0xC08A63,0x8A5C3B,0xD9A57E,0xE0B48C][i]});
      s.position.set(-16+i*10.6,0,11.5);
      s.rotation.y=Math.PI;
      g.add(s); h.stu.push({s,m:'work',ph:rnd(0,TAU)});
    }

    const lab=new Panel(26,5.6,{bg:'rgba(43,60,146,0.94)',border:'rgba(255,255,255,0.35)'});
    lab.set([{t:'GLOBAL MEDIA OBSERVATORY',s:1.15,w:700,c:'#fff',a:'center'}]);
    lab.at(g,0,20,0);
    h.lab=lab.mesh;

    const p=new Panel(28,16,{accent:C_RED});
    p.set([
      {t:'WHAT WE BUILD',s:0.66,w:700,c:C_RED},
      {t:'Daily analytical briefs on regional media',s:0.96,w:600,c:C_WHITE,sp:0.34},
      {t:'Quarterly research papers on ethics and policy',s:0.96,w:600,c:C_WHITE,sp:0.14},
      {t:'Faculty commentary published within four hours',s:0.96,w:600,c:C_WHITE,sp:0.14},
      {t:'Regional press presence covering Arab advertising and festivals',s:0.86,w:600,c:C_WHITE,sp:0.14},
      {t:'Students report and draft. The Observatory validates and signs.',s:0.84,w:500,c:C_DIM,sp:0.40}
    ]);
    p.at(g,-42,18,-8);
  },
  update(h,l,t){
    h.r1.rotation.z=t*0.16;
    h.r2.rotation.z=-t*0.11;
    h.lab.position.y=20+Math.sin(t*0.7)*0.4;
    h.gl.rotation.y=t*0.28;
    h.sats.forEach((s,i)=>{
      const a=t*0.9+i*TAU/4;
      s.position.set(Math.cos(a)*10.5,Math.sin(a*1.3+i)*3.2,Math.sin(a)*10.5);
    });
    h.sheets.forEach((s,i)=>{
      const a=t*0.32+i*TAU/6;
      s.position.set(Math.cos(a)*26,20+Math.sin(a*1.7+i*1.1)*7,Math.sin(a)*26);
      s.rotation.set(a*0.7,a*1.3,a*0.4);
    });
    for(const s of h.stu) animStudent(s.s,t+s.ph,s.m);
  }
},3);

/* ------------------- 04 CASE 03 SIXTY SECOND LESSON ------------------- */
slide({
  kick:'CASE 03 · NORTHWESTERN MEDILL, EVANSTON',
  h1:'Sixty seconds, three parts',
  hp:'Medill pioneered integrated marketing. Nightlab creates open-source storytelling tools. We adopt their structured one-minute breakdown.',
  cam:{d:82,h:26,y:14},
  build(h){
    const g=h.g;
    g.add(stageBase(40));
    const reelTex=(ph)=>screenTex(320,580,(c,w,H)=>{
      c.fillStyle='#0A0C12'; c.fillRect(0,0,w,H);
      const gr=c.createLinearGradient(0,0,0,H);
      gr.addColorStop(0,'#3B1060'); gr.addColorStop(1,'#0E2A6B');
      c.fillStyle=gr; c.fillRect(0,0,w,H);
      c.fillStyle='rgba(0,0,0,0.30)'; c.fillRect(0,0,w,H);
      c.textAlign='center';
      const st=[['THE FIRST 3 SECONDS','STOP THE SCROLL'],['CASE BREAKDOWN','SHOW THE WORK'],['CALL TO ACTION','DO IT NOW']][ph];
      c.fillStyle='#fff'; c.font='800 31px '+SANS; c.fillText(st[0],w/2,H*0.42);
      c.font='500 20px '+SANS; c.fillStyle='rgba(255,255,255,0.86)'; c.fillText(st[1],w/2,H*0.50);
      c.textAlign='left';
      c.fillStyle='#fff'; c.font='700 17px '+SANS; c.fillText('@bue.fcmm',16,32);
      c.fillStyle='#ED1F2C'; c.beginPath(); c.arc(w-26,26,9,0,TAU); c.fill();
      c.fillStyle='rgba(0,0,0,0.58)'; c.fillRect(0,H-104,w,104);
      c.fillStyle='#fff'; c.font='400 15px '+SANS; c.fillText('60 SECOND LESSON  ·  BUE FCMM',16,H-74);
      c.fillStyle='#39406B'; c.fillRect(16,H-56,288,8);
      c.fillStyle='#ED1F2C'; c.fillRect(16,H-56,288*((ph*0.33)+0.06),8);
      c.fillStyle='#CFD9DF'; c.font='400 13px '+SANS;
      c.textAlign='left'; c.fillText('0:0'+(ph*20),16,H-22);
      c.textAlign='right'; c.fillText('1:00',304,H-22); c.textAlign='left';
    }).t;
    const ph=phoneBody(g,17,31,reelTex(0),0,22,0);
    h.phone=ph; h.reelTex=reelTex;

    const badge=new Panel(9,3.0,{bg:'rgba(237,31,44,0.94)',border:'rgba(255,255,255,0.35)'});
    badge.set([{t:'60 SEC',s:1.15,w:800,c:'#fff',a:'center'}]);
    badge.at(g,0,36,0);
    h.badge=badge.mesh;

    const stages=[{lab:'0 to 15s',t:'HOOK',c:C_RED},{lab:'15 to 45s',t:'THE CASE',c:'#E7B84B'},{lab:'45 to 60s',t:'THE ASK',c:'#5FD08A'}];
    h.stages=[]; h.glows=[];
    stages.forEach((s,i)=>{
      const p=new Panel(13,5.4,{bg:'rgba(6,7,14,0.88)'});
      p.set([{t:s.lab,s:0.7,w:500,c:'#8E97AF',a:'center'},{t:s.t,s:1.35,w:700,c:s.c,a:'center',sp:0.14}]);
      p.at(g,-21+i*21,3.0,19);
      h.stages.push(p.mesh);
      h.glows.push(box(g,15,0.30,0.6,glow({color:s.c,opacity:0.0}),-21+i*21,0.7,19));
    });

    h.stu=[];
    const a1=student({shirt:0x2B3C92});
    a1.position.set(-13,0,10); a1.rotation.y=0.6; g.add(a1); h.stu.push({s:a1,m:'shoot',ph:0});
    const b1=student({shirt:0x8E3A32,skin:0x8A5C3B});
    b1.position.set(13,0,9.4); b1.rotation.y=-0.6; g.add(b1); h.stu.push({s:b1,m:'shoot',ph:1.2});
    const c1=student({shirt:0x39406B,skin:0xD9A57E});
    c1.position.set(0,0,14); c1.rotation.y=Math.PI; g.add(c1); h.stu.push({s:c1,m:'present',ph:2.4});

    const soft1=new THREE.Group();
    soft1.position.set(-24,0,8);
    soft1.rotation.y=-0.5;
    cyl(soft1,0.3,0.4,7,10,std({color:0x232838,metalness:.6}),0,3.5,0);
    for(let i=0;i<3;i++){
      const ang=i*TAU/3;
      const leg=box(soft1,0.22,4.4,0.22,std({color:0x1B2030}),Math.cos(ang)*1.0,2.0,Math.sin(ang)*1.0);
      leg.rotation.z=Math.cos(ang)*-0.42; leg.rotation.x=Math.sin(ang)*0.42;
    }
    box(soft1,0.5,8,0.5,std({color:0x161A25}),0,8.4,0);
    box(soft1,0.4,8.6,9.4,std({color:0x12161F,roughness:.6}),0,9.4,4.4);
    box(soft1,0.2,7.8,8.6,glow({color:0xEAF0FF,opacity:0.55}),0.30,9.4,4.4);
    g.add(soft1);

    const soft2=new THREE.Group();
    soft2.position.set(25,0,4);
    soft2.rotation.y=Math.PI+0.5;
    cyl(soft2,0.3,0.4,6,10,std({color:0x232838,metalness:.6}),0,3,0);
    for(let i=0;i<3;i++){
      const ang=i*TAU/3;
      const leg=box(soft2,0.22,4,0.22,std({color:0x1B2030}),Math.cos(ang)*0.9,1.8,Math.sin(ang)*0.9);
      leg.rotation.z=Math.cos(ang)*-0.42; leg.rotation.x=Math.sin(ang)*0.42;
    }
    box(soft2,0.4,6,0.4,std({color:0x161A25}),0,6,0);
    box(soft2,0.35,6.2,6.8,std({color:0x12161F,roughness:.6}),0,6.4,3.2);
    box(soft2,0.18,5.6,6.0,glow({color:0xFFD9B0,opacity:0.50}),0.28,6.4,3.2);
    g.add(soft2);

    const p=new Panel(28,13,{accent:C_INDIGO});
    p.set([
      {t:'THE FORMAT',s:0.66,w:700,c:C_INDIGO},
      {t:'One-minute production breakdown',s:0.96,w:600,c:C_WHITE,sp:0.32},
      {t:'Hook, concrete case study, call to action',s:0.96,w:600,c:C_WHITE,sp:0.14},
      {t:'Psychological analysis of regional campaigns',s:0.88,w:600,c:C_WHITE,sp:0.14},
      {t:'Educational series demystifying media production',s:0.86,w:600,c:C_WHITE,sp:0.14}
    ]);
    p.at(g,-40,17,-6);
  },
  update(h,l,t){
    const seg=Math.min(2,Math.floor((t*0.30)%3));
    if(h._seg!==seg){
      h._seg=seg;
      h.phone.userData.screen.material.map=h.reelTex(seg);
      h.phone.userData.screen.material.needsUpdate=true;
    }
    h.badge.position.y=36+Math.sin(t*0.8)*0.35;
    h.stages.forEach((p,i)=>{ p.position.y=3.0+Math.sin(t*1.0+i*0.7)*0.2; });
    h.glows.forEach((q,i)=>{
      const target=(h._seg===i)?0.9:0.0;
      q.material.userData.base=lerp(q.material.userData.base,target,0.12);
      q.material.opacity=q.material.userData.base;
    });
    h.phone.position.y=22+Math.sin(t*0.7)*0.28;
    for(const s of h.stu) animStudent(s.s,t+s.ph,s.m);
  }
},4);

/* -------------------- 05 REMITTANCES AND EGYPT -------------------- */
slide({
  kick:'THE MARKET',
  h1:'Capturing Egypt\'s remittance corridor',
  hp:'Egypt receives $41.5B in annual remittances. Just 1% represents $410M in addressable higher education capacity.',
  cam:{d:99,h:33,y:10},
  build(h){
    const g=h.g;
    g.add(stageBase(48));
    const mapGrp=new THREE.Group();
    mapGrp.rotation.x=0;
    mapGrp.position.set(-4,0.9,2);
    mapGrp.scale.setScalar(2.0);
    g.add(mapGrp);
    const SC=1.5;
    add(mapGrp,egyptGeo(SC,1.0),std({color:0x3A4C8E,roughness:.5,metalness:.3,emissive:0x4A67D6,emissiveIntensity:.95}),0,0,0);
    mapGrp.add(egyptBorder(SC,1.08,0xED1F2C));
    const lgl=backdrop(26,24,0x3D57C4,0.26);
    lgl.position.set(0,2.6,1.2);
    mapGrp.add(lgl);
    const eglab=new Panel(12,2.6,{bg:'rgba(237,31,44,0.94)',border:'rgba(255,255,255,0.35)'});
    eglab.set([{t:'EGYPT',s:1.15,w:800,c:'#fff',a:'center'}]);
    eglab.at(g,-4,7.2,2);
    h.eglab=eglab.mesh;

    const campus=new THREE.Group();
    campus.position.set(-3.4,3.1,-10);
    campus.scale.setScalar(1.2);
    bldg(campus,7,9,6,{brick:0x8E3A32});
    pitchedRoof(campus,7.4,2.4,6.4);
    bldg(campus,5,6,5,{brick:0x7E342D});
    pitchedRoof(campus,5.4,2.0,5.4);
    bldg(campus,4,17,4,{brick:0x8E3A32});
    box(campus,4.6,0.6,4.6,std({color:0xDCD3C4}),0,17.3,0);
    const sp=sparkMesh(1.5,RED,RED); sp.position.set(0,10.5,2.2); campus.add(sp);
    const fl=flagPole(campus,21); fl.position.set(2.6,0,2.4);
    g.add(campus);
    h.campusSpark=sp;
    const gl=new THREE.Group();
    gl.position.set(30,20,-8);
    const earthTx=screenTex(1024,512,(c,w,H)=>{
      const oc=c.createLinearGradient(0,0,0,H);
      oc.addColorStop(0,'#274E7D'); oc.addColorStop(0.5,'#1B3A63'); oc.addColorStop(1,'#12294A');
      c.fillStyle=oc; c.fillRect(0,0,w,H);
      c.fillStyle='#EDF2F6'; c.fillRect(0,0,w,26); c.fillRect(0,H-30,w,30);
      const land=[[.08,.30,.10,.06],[.22,.42,.13,.09],[.30,.28,.07,.05],[.44,.36,.11,.08],[.55,.48,.09,.06],[.62,.30,.10,.07],[.72,.44,.12,.08],[.82,.32,.08,.05],[.52,.62,.10,.05],[.36,.60,.08,.05]];
      c.fillStyle='#4E7A4E';
      land.forEach(L=>{ c.beginPath(); c.ellipse(w*L[0],H*L[1],w*L[2],H*L[3],0.4,0,TAU); c.fill(); });
      c.fillStyle='#8A9A5B';
      land.forEach(L=>{ c.beginPath(); c.ellipse(w*L[0]+14,H*L[1]-10,w*L[2]*0.55,H*L[3]*0.55,0.4,0,TAU); c.fill(); });
      c.strokeStyle='rgba(160,190,230,0.20)'; c.lineWidth=1;
      for(let i=1;i<12;i++){ c.beginPath(); c.moveTo(w*i/12,0); c.lineTo(w*i/12,H); c.stroke(); }
      for(let i=1;i<6;i++){ c.beginPath(); c.moveTo(0,H*i/6); c.lineTo(w,H*i/6); c.stroke(); }
    }).t;
    add(gl,new THREE.SphereGeometry(12,40,28),std({map:earthTx,roughness:.55,metalness:.12,emissive:0x0A1A3A,emissiveIntensity:.35}));
    wireGlobe(gl,12.15,0x8FA0E8,0.16);
    const egm=add(gl,egyptGeo(0.11,0.2),glow({color:RED,opacity:0.95}));
    egm.position.set(0,6.9,9.2);
    egm.rotation.set(0.4,0.2,0);
    g.add(gl);
    h.globe=gl;

    const billTex=screenTex(300,140,(c,w,H)=>{
      const gr=c.createLinearGradient(0,0,w,H);
      gr.addColorStop(0,'#D8E6C4'); gr.addColorStop(1,'#A9C48C');
      c.fillStyle=gr; c.fillRect(0,0,w,H);
      c.strokeStyle='rgba(60,90,50,0.55)'; c.lineWidth=3; c.strokeRect(8,8,w-16,H-16);
      c.fillStyle='#2E4A24'; c.font='800 40px '+SANS; c.fillText('$',22,84);
      c.font='700 22px '+SANS; c.fillText('100',72,66);
      c.font='400 12px '+SANS; c.fillText('TUITION',72,86);
    }).t;

    h.flights=[];
    for(let i=0;i<4;i++){
      const a1=0.45+i*0.34;
      const p0=new THREE.Vector3(30+Math.cos(a1)*12.6,20+Math.sin(a1)*12.6,-8+Math.sin(a1)*3.0);
      const p2=new THREE.Vector3(-3.4,4.2,-10);
      const mid=p0.clone().lerp(p2,0.5);
      mid.y+=8+i*2;
      const curve=new THREE.QuadraticBezierCurve3(p0,mid,p2);
      const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,52,0.16,6,false),glow({color:i%2?INDIGO:RED,opacity:0.5}));
      g.add(tube);
      const bills=[];
      for(let k=0;k<3;k++) bills.push(box(g,4.4,2.1,0.10,bas({map:billTex}),0,0,0));
      h.flights.push({curve,bills});
    }

    h.stu=[];
    for(let i=0;i<6;i++){
      const s=student({shirt:i%2?0x2B3C92:0x8E3A32,skin:[0xC08A63,0x8A5C3B,0xD9A57E,0xE0B48C,0x6B4530,0xC08A63][i]});
      const a=-1.15+i*0.42;
      s.position.set(-3.4+Math.cos(a)*10,3.1,-10+Math.sin(a)*7.5);
      s.rotation.y=-a;
      s.scale.setScalar(0.001);
      g.add(s);
      const bulb=new THREE.Group();
      sph(bulb,0.52,glow({color:0xFFD98A,opacity:0.95}),0,0,0,12,10);
      cyl(bulb,0.22,0.26,0.46,10,std({color:0x9AA3B8,metalness:.7,roughness:.35}),0,-0.70,0);
      bulb.add(softSprite(0xFFD98A,5.8,0.5));
      bulb.position.set(s.position.x,7.3,s.position.z);
      bulb.visible=false;
      g.add(bulb);
      h.stu.push({s,b:bulb,m:'stand',ph:rnd(0,TAU),dl:i*0.30});
    }

    const s1=new Panel(15,9,{bg:'rgba(237,31,44,0.94)',border:'rgba(255,255,255,0.3)'});
    s1.set([
      {t:'EACH YEAR',s:0.66,w:700,c:'#FFD5D8',a:'center'},
      {t:'$41.5B',s:2.5,w:800,c:'#fff',a:'center',sp:0.20},
      {t:'in remittances',s:0.82,w:500,c:'#FFE3E5',a:'center',sp:0.10}
    ]);
    s1.at(g,-12,29,6);
    const s2=new Panel(15,9,{bg:'rgba(43,60,146,0.94)',border:'rgba(255,255,255,0.3)'});
    s2.set([
      {t:'ONE PERCENT',s:0.66,w:700,c:'#D6DEFA',a:'center'},
      {t:'$410M',s:2.5,w:800,c:'#fff',a:'center',sp:0.20},
      {t:'of tuition capacity',s:0.82,w:500,c:'#D6DEFA',a:'center',sp:0.10}
    ]);
    s2.at(g,10,29,6);
    h.s1=s1.mesh; h.s2=s2.mesh;

    h.aud=[];
    ['Egyptian students','Gulf families','Arab residents','Expat families'].forEach((a,i)=>{
      const p=new Panel(13,2.9,{bg:'rgba(6,7,14,0.82)'});
      p.set([{t:a,s:0.80,w:600,c:C_WHITE,a:'center'}]);
      p.at(g,-24+i*16,3.4,26);
      h.aud.push(p.mesh);
    });

    const p=new Panel(28,10,{accent:C_INDIGO});
    p.set([
      {t:'VALUE PROPOSITION',s:0.66,w:700,c:C_INDIGO},
      {t:'Dual UK degree, five pathways, published bylines',s:0.96,w:600,c:C_WHITE,sp:0.30},
      {t:'Bilingual production captures Gulf and expat demand',s:0.88,w:500,c:C_DIM,sp:0.20}
    ]);
    p.at(g,-34,24,10,0,0.32);
  },
  update(h,l,t,dt){
    h.globe.rotation.y=t*0.22;
    h.campusSpark.rotation.z=t*0.6;
    h.s1.position.y=29+Math.sin(t*0.8)*0.4;
    h.s2.position.y=29+Math.sin(t*0.8+0.9)*0.4;
    h.aud.forEach((a,i)=>{ a.position.y=3.4+Math.sin(t*0.9+i*0.7)*0.18; });
    h.flights.forEach((f,gi)=>{
      f.bills.forEach((b,k)=>{
        const u=((t*0.17+k*0.333+gi*0.17)%1);
        b.position.copy(f.curve.getPoint(u));
        b.rotation.set(u*4,u*3,u*2);
        b.scale.setScalar(0.6+0.6*Math.sin(Math.PI*u));
      });
    });
    h.stu.forEach(s=>{
      const pop=clamp((l-0.6-s.dl)/1.2,0,1);
      s.s.scale.setScalar(Math.max(0.001,easeOut(pop)));
      s.b.visible=pop>0.9;
      s.b.position.y=7.3+Math.sin(t*2.0+s.dl*8)*0.22;
      s.b.rotation.y=t*0.8;
      animStudent(s.s,t+s.ph,s.m);
    });
  }
},5);

/* ---------------------- 06 CHANNELS ---------------------- */
slide({
  kick:'DISTRIBUTION',
  h1:'Five channels, tailored audiences',
  hp:'One integrated newsroom. Distinct editorial packaging for each platform.',
  cam:{d:92,h:32,y:14},
  build(h){
    const g=h.g;
    g.add(stageBase(46));
    const chans=[
      {n:'YOUTUBE',c:'#ED1F2C',cap:'Long-form documentaries, lectures, master archive'},
      {n:'INSTAGRAM',c:'#C1559B',cap:'Visual student showcase and campus culture'},
      {n:'TIKTOK',c:'#2FD6C0',cap:'Fast 60-second lessons for youth discovery'},
      {n:'LINKEDIN',c:'#5B8DEF',cap:'Faculty research and corporate partnerships'},
      {n:'FACEBOOK',c:'#7FA0D8',cap:'Parent engagement and regional alumni network'}
    ];
    h.chans=[]; h.posts=[];
    chans.forEach((ch,i)=>{
      const a=-1.05+i*0.525, R=27, col=parseInt(ch.c.slice(1),16);
      const grp=new THREE.Group();
      grp.position.set(Math.sin(a)*R,0,Math.cos(a)*R);
      grp.rotation.y=a;
      g.add(grp);
      cyl(grp,4.4,4.9,1.4,32,std({color:0x141828,roughness:.6,metalness:.3}),0,0.7,0);
      const halo=softSprite(col,17,0.30);
      halo.position.set(0,8,0); grp.add(halo);
      const disc=cyl(grp,4.0,4.0,0.5,40,glow({color:col,opacity:0.24}),0,8.4,0);
      disc.rotation.x=Math.PI/2;
      const ring=tor(grp,4.4,0.22,glow({color:col,opacity:0.75}),0,8.4,0.35,6,60);
      const glyph=new THREE.Group();
      if(i===0||i===2){
        const tri=add(glyph,new THREE.ConeGeometry(1.5,2.4,3),bas({color:0xFFFFFF}),0,0,0);
        tri.rotation.x=-Math.PI/2; tri.rotation.z=Math.PI;
      } else if(i===1){
        const r1=tor(glyph,1.55,0.30,bas({color:0xFFFFFF}),0,0,0,6,40); r1.scale.set(1,1,0.35);
        const r2=tor(glyph,0.95,0.24,bas({color:0xFFFFFF}),0,0,0,6,36); r2.scale.set(1,1,0.35);
        cyl(glyph,0.24,0.24,0.3,12,bas({color:0xFFFFFF}),0,0,0);
      } else if(i===3){
        box(glyph,2.9,0.34,0.2,bas({color:0xFFFFFF}),0,1.0,0);
        box(glyph,0.34,2.9,0.2,bas({color:0xFFFFFF}),-1.28,0,0);
        box(glyph,1.3,0.34,0.2,bas({color:0xFFFFFF}),0.35,0,0);
      } else {
        box(glyph,2.8,1.7,0.2,bas({color:0xFFFFFF}),0,0.2,0);
        box(glyph,0.9,1.0,0.3,bas({color:col}),0,-0.2,0.05);
      }
      glyph.position.set(0,8.4,0.5);
      grp.add(glyph);
      const p=new Panel(17,5.8,{bg:'rgba(6,7,14,0.92)',border:'rgba(255,255,255,0.14)'});
      p.set([{t:ch.n,s:1.20,w:700,c:ch.c,a:'center'},{t:ch.cap,s:0.80,w:500,c:C_WHITE,a:'center',sp:0.18}]);
      p.at(g,-40+i*20,3.4,25);
      h.chans.push({glyph,ring,panel:p.mesh,disc,a,R,px:-40+i*20});
      for(let k=0;k<3;k++){
        h.posts.push({m:box(g,2.0,2.8,0.08,bas({map:POST_TEX}),0,0,0),a,ch:i,ph:rnd(0,TAU)});
      }
    });

    h.fan=[];
    for(let i=0;i<16;i++){
      const a=-1.45+i*0.19, R=41;
      const s=student({shirt:0x39406B,skin:[0xC08A63,0x8A5C3B,0xD9A57E,0xE0B48C][i%4]});
      s.position.set(Math.sin(a)*R,0,Math.cos(a)*R);
      s.rotation.y=a+Math.PI;
      s.scale.setScalar(0.92);
      g.add(s);
      h.fan.push({s,ph:rnd(0,TAU)});
    }
    for(let i=0;i<6;i++) walker(g,{r:34+i*0.6,speed:2.1+i*0.14,shirt:i%2?0x2B3C92:0x8E3A32,ph:rnd(0,TAU),y0:0.1});

    const p=new Panel(30,10,{accent:C_RED});
    p.set([
      {t:'PRODUCTION DISCIPLINE',s:0.66,w:700,c:C_RED},
      {t:'Never produce identical content twice.',s:1.10,w:600,c:C_WHITE,sp:0.30},
      {t:'One verified story, adapted across five formats, delivered to its native audience.',s:0.86,w:500,c:C_DIM,sp:0.22}
    ]);
    p.at(g,0,29,4);
  },
  update(h,l,t){
    runWalkers(h.g,t);
    h.chans.forEach((c,i)=>{
      c.glyph.rotation.z=t*(0.2+i*0.06);
      c.ring.rotation.z=-t*0.4;
      c.panel.position.y=3.4+Math.sin(t*1.0+i*0.8)*0.2;
      c.disc.material.userData.base=0.24+0.10*Math.sin(t*1.6+i);
      c.disc.material.opacity=c.disc.material.userData.base;
    });
    h.posts.forEach(p=>{
      const u=((t*0.20+p.ph)%1);
      const R=27+22*u;
      p.m.position.set(Math.sin(p.a)*R,6+u*7+Math.sin(u*Math.PI)*3.5,Math.cos(p.a)*R-6);
      p.m.rotation.set(0.2,u*2.2,u*0.3);
      p.m.scale.setScalar(0.7+0.6*u);
      p.m.material.opacity=p.m.material.userData.base*(1-clamp((u-0.82)/0.18,0,1));
    });
    h.fan.forEach(f=>{
      animStudent(f.s,t+f.ph,'stand');
      f.s.position.y=Math.abs(Math.sin(t*1.4+f.ph))*0.06;
    });
  }
},6);

/* ------------------- 07 GENERATIVE AI SEARCH ------------------- */
slide({
  kick:'SEARCH',
  h1:'Earn the recommendation in AI search',
  hp:'Ask an AI assistant where to study mass communication in Egypt. Today it recommends two legacy peers. BUE is absent.',
  cam:{d:96,h:30,y:16},
  build(h){
    const g=h.g;
    g.add(stageBase(42));
    const Q='Where do I send my child for mass communication in Egypt?';
    const schools=['Cairo University','American University in Cairo','Arab Academy for Science and Technology','BUE · Mass Communication'];
    const mkTex=(who,col,after)=>screenTex(420,720,(c,w,H)=>{
      c.fillStyle='#0A0C14'; c.fillRect(0,0,w,H);
      c.fillStyle=col; c.fillRect(0,0,w,64);
      c.fillStyle='#0A0C14'; c.font='700 26px '+SANS; c.fillText(who,20,40);
      c.fillStyle='#1B2033'; c.fillRect(20,86,w-40,86);
      c.fillStyle='#CFD9DF'; c.font='400 18px '+SANS;
      wrapLines(c,Q,w-64,18,118,25);
      c.fillStyle='#ED1F2C'; c.fillRect(0,200,w,2);
      c.fillStyle='#5C6379'; c.font='400 13px '+SANS; c.fillText('SUGGESTED',20,228);
      const order=after?[3,0,1]:[0,1,2,3];
      order.forEach((si,k)=>{
        const y=252+k*104, bue=(si===3), top=(after&&k===0);
        c.fillStyle=top?'rgba(237,31,44,0.22)':'rgba(255,255,255,0.045)';
        c.fillRect(20,y,w-40,84);
        c.strokeStyle=top?'#ED1F2C':'rgba(207,217,223,0.14)';
        c.lineWidth=top?3:1.5; c.strokeRect(20,y,w-40,84);
        c.fillStyle=top?'#ED1F2C':'#39406B';
        c.fillRect(32,y+20,44,44);
        c.fillStyle=top?'#fff':'#8E97AF';
        c.font='700 20px '+SANS; c.textAlign='center';
        c.fillText(String(k+1),54,y+50); c.textAlign='left';
        c.fillStyle=(bue&&!after)?'#6C7590':(top?'#FFFFFF':'#CFD9DF');
        c.font='600 19px '+SANS;
        c.fillText(schools[si],90,y+40);
        c.fillStyle=top?'#FFB8BE':'#5C6379';
        c.font='400 14px '+SANS;
        c.fillText(bue?(after?'dual degree · UK partner':''):'private university',90,y+64);
        if(bue&&!after){
          c.fillStyle='rgba(237,31,44,0.95)';
          c.font='700 14px '+SANS; c.fillText('MISSING',90,y+64);
        }
      });
      c.fillStyle='#39406B'; c.fillRect(0,H-52,w,52);
      c.fillStyle='#5C6379'; c.font='400 13px '+SANS; c.fillText('Public web and model weights',20,H-22);
    });
    h.pairs=[];
    [['CHATGPT','#10A37F'],['CLAUDE','#D97757'],['GEMINI','#5B8DEF']].forEach((n,i)=>{
      const before=phoneBody(g,17,30,mkTex(n[0],n[1],false).t,(i-1)*20,17,2);
      before.rotation.y=(i-1)*-0.16;
      const after=phoneBody(g,17,30,mkTex(n[0],n[1],true).t,(i-1)*20,17,2);
      after.rotation.y=(i-1)*-0.16;
      after.visible=false;
      h.pairs.push({before,after});
    });

    const buerow=new THREE.Group();
    const chip=box(buerow,17,3.4,0.5,glow({color:RED,opacity:0.9}),0,0,0);
    const r1=tor(buerow,1.7,0.28,bas({color:0xFFFFFF,opacity:0.9}),-8.6,0,0.3,6,32);
    r1.scale.set(1,1,0.4);
    buerow.position.set(0,6.5,9);
    buerow.scale.setScalar(0.7);
    g.add(buerow);
    h.buerow=buerow;

    const fg=new THREE.Group();
    fg.position.set(0,0,26);
    g.add(fg);
    const fdesk=std({color:0x1E2333,roughness:.6,metalness:.3});
    const ftop=std({color:0x39406B,roughness:.45,metalness:.4});
    box(fg,17,0.3,5,ftop,0,2.0,0);
    box(fg,0.5,2.0,0.5,fdesk,-8,1.0,0);
    box(fg,0.5,2.0,0.5,fdesk,8,1.0,0);
    box(fg,14,0.3,0.4,fdesk,0,0.9,-1.8);
    const lap=box(fg,3.2,0.24,2.2,std({color:0x11141F,roughness:.5,metalness:.5}),0,2.4,-0.6);
    lap.rotation.x=-0.28;
    box(fg,2.9,1.9,0.08,glow({color:0x5C7BFF,opacity:0.55}),0,3.0,-1.62);
    cyl(fg,0.12,0.16,3.4,8,std({color:0x2A3040,metalness:.6}),-6.6,3.7,0.6);
    add(fg,new THREE.ConeGeometry(0.9,1.1,14,1,true),std({color:0x2A3040,metalness:.5,side:THREE.DoubleSide}),-6.6,5.5,0.6);
    add(fg,new THREE.SphereGeometry(0.28,10,8),glow({color:0xFFD9B0,opacity:0.95}),-6.6,5.3,0.6);
    const deskGlow=softSprite(0x5C7BFF,14,0.18);
    deskGlow.position.set(0,2.2,0);
    fg.add(deskGlow);
    const who=student({shirt:0x8E3A32,skin:0xC08A63});
    who.position.set(-5.6,0,1.4);
    who.rotation.y=Math.PI+0.34;
    fg.add(who);
    h.who=who;

    const badge=new Panel(20,5.0,{bg:'rgba(237,31,44,0.94)',border:'rgba(255,255,255,0.35)'});
    badge.set([{t:'TARGET',s:0.62,w:700,c:'#FFD5D8',a:'center'},{t:'BUE first',s:1.45,w:800,c:'#fff',a:'center',sp:0.14}]);
    badge.at(g,0,36,2);
    h.badge=badge.mesh;

    const p=new Panel(28,13.5,{accent:C_INDIGO});
    p.set([
      {t:'THE OPTIMIZATION',s:0.66,w:700,c:C_INDIGO},
      {t:'Publish open reporting indexable by LLM crawlers',s:0.92,w:600,c:C_WHITE,sp:0.28},
      {t:'Schema structured data on all student and faculty work',s:0.90,w:600,c:C_WHITE,sp:0.13},
      {t:'Build cited web authority that LLM weights retrieve',s:0.90,w:600,c:C_WHITE,sp:0.13},
      {t:'Publish breaking news analysis within four hours',s:0.90,w:600,c:C_WHITE,sp:0.13},
      {t:'When prospective families query AI, BUE ranks first.',s:0.86,w:500,c:C_DIM,sp:0.36}
    ]);
    p.at(g,-44,20,-6);
  },
  update(h,l,t){
    h.badge.position.y=36+Math.sin(t*0.8)*0.35;
    const flip=clamp((l-4.2)/1.3,0,1);
    h.pairs.forEach(p=>{
      p.before.visible=flip<0.5;
      p.after.visible=flip>=0.5;
      const y=17+Math.sin(t*0.7)*0.25;
      p.before.position.y=y; p.after.position.y=y;
    });
    animStudent(h.who,t,'type');
    const rise=clamp((l-4.4)/2.0,0,1);
    h.buerow.position.y=lerp(6.5,17.4,easeOut(rise));
    h.buerow.position.z=lerp(9,4.4,easeOut(rise));
    h.buerow.scale.setScalar(lerp(0.7,1.0,easeOut(rise)));
    h.buerow.rotation.y=Math.sin(t*0.9)*0.05;
    h.buerow.visible=rise>0.02;
    h.buerow.traverse(o=>{
      if(o.material){
        o.material.opacity=(o.material.userData.base===undefined?1:o.material.userData.base)*rise;
        o.material.transparent=true;
      }
    });
  }
},7);

function wrapLines(c,txt,maxW,size,y0,lh){
  c.save();
  c.textBaseline='top';
  const words=txt.split(' ');
  let line='',y=y0;
  for(const w of words){
    const t=line?line+' '+w:w;
    if(c.measureText(t).width>maxW&&line){ c.fillText(line,32,y); y+=lh; line=w; }
    else line=t;
  }
  c.fillText(line,32,y);
  c.restore();
}

/* ---------------------- 08 TIMELINE ---------------------- */
slide({
  kick:'SEQUENCE',
  h1:'Four phases to operational scale',
  hp:'Every phase assigns a designated faculty lead and committed capital line.',
  cam:{d:98,h:34,y:15},
  build(h){
    const g=h.g;
    g.add(stageBase(48));
    const ph=[
      {n:'01',t:'MONTHS 1 TO 3',s:'Foundation',b:'Appoint editorial board. Fit studio. Launch five channels.',c:INDIGO,h:8},
      {n:'02',t:'MONTHS 4 TO 6',s:'Launch',b:'Open student newsroom. Launch observatory. Sign 10 partners.',c:RED,h:12},
      {n:'03',t:'MONTHS 7 TO 12',s:'Scale',b:'Scale daily publishing. Expand international admissions.',c:0x5C6BC0,h:16},
      {n:'04',t:'YEARS 2 TO 3',s:'Authority',b:'Publish annual media index. Provide routine expert commentary.',c:PLUM,h:20}
    ];
    h.panels=[];
    ph.forEach((p,i)=>{
      const x=-38+i*20, hgt=p.h, col=new THREE.Color(p.c);
      box(g,14,hgt,14,std({color:0x1A2033,roughness:.6,metalness:.3}),x,hgt/2,0);
      box(g,14.4,0.5,14.4,glow({color:p.c,opacity:0.55}),x,hgt+0.2,0);
      for(let k=0;k<4;k++) box(g,14.3,0.16,14.3,glow({color:p.c,opacity:0.30}),x,1.6+k*(hgt/5),0);
      const sp=sparkMesh(1.4,new THREE.Color(p.c),new THREE.Color(p.c));
      sp.position.set(x,hgt*0.66,7.2);
      g.add(sp);
      const pn=new Panel(18,8.4,{bg:'rgba(6,7,14,0.92)',border:'rgba(255,255,255,0.14)'});
      pn.set([
        {t:p.n+'  ·  '+p.t,s:0.62,w:700,c:'#'+col.getHexString()},
        {t:p.s,s:1.34,w:700,c:C_WHITE,sp:0.22},
        {t:p.b,s:0.80,w:500,c:C_DIM,sp:0.20}
      ]);
      pn.at(g,x,26,22);
      h.panels.push({m:pn.mesh,y:26});
      const pl=new Panel(14,3.0,{bg:'rgba(6,7,14,0.94)',border:'rgba(237,31,44,0.45)'});
      pl.set([{t:'PHASE '+p.n,s:0.88,w:700,c:C_RED,a:'center'}]);
      pl.at(g,x,1.4,11);
    });

    const path=[];
    for(let i=0;i<40;i++){
      const t=i/39;
      path.push(new THREE.Vector3(lerp(-38,22,t),lerp(8.6,20.6,t)+1.1,-3));
    }
    const curve=new THREE.CatmullRomCurve3(path);
    const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,80,0.20,6,false),glow({color:RED,opacity:0.7}));
    g.add(tube);
    /* energy pulses traveling along the roadmap */
    h.flow=[];
    for(let k=0;k<7;k++){
      const d=sph(g,0.42,glow({color:k%2?0xE7B84B:0xF2F5FA,opacity:0.95}),0,-50,0,8,6);
      d.add(softSprite(k%2?0xE7B84B:0xF2F5FA,3.4,0.5));
      h.flow.push({d,ph:k/7});
    }
    h.tcurve=curve;

    const arch=new THREE.Group();
    arch.position.set(42,0,0);
    const a1=tor(arch,8,0.42,glow({color:0xE7B84B,opacity:0.85}),0,23,0,6,64,Math.PI);
    box(arch,1.0,23,1.0,std({color:0x1A1F2E,metalness:.4}),-8,11.5,0);
    box(arch,1.0,23,1.0,std({color:0x1A1F2E,metalness:.4}),8,11.5,0);
    g.add(arch);
    h.arch=arch;

    const t30=new Panel(14,4.2,{bg:'rgba(231,184,75,0.94)',border:'rgba(255,255,255,0.4)'});
    t30.set([{t:'2030',s:1.8,w:800,c:'#1A1A1E',a:'center'}]);
    t30.at(g,42,33,0);
    const tg=new Panel(20,8.4,{bg:'rgba(6,7,14,0.92)'});
    tg.set([
      {t:'30%',s:1.4,w:800,c:'#E7B84B'},
      {t:'international student enrollment',s:0.76,w:500,c:C_WHITE,sp:0.10},
      {t:'100 vetted industry partners',s:0.76,w:500,c:C_WHITE,sp:0.30},
      {t:'Syndicated reporting across MENA',s:0.76,w:500,c:C_WHITE,sp:0.12}
    ]);
    tg.at(g,42,15,2);
    h.t30=t30.mesh; h.tg=tg.mesh;
  },
  update(h,l,t){
    h.arch.rotation.y=Math.sin(t*0.3)*0.05;
    h.t30.position.y=33+Math.sin(t*0.7)*0.4;
    h.panels.forEach((p,i)=>{ p.m.position.y=p.y+Math.sin(t*0.9+i*0.8)*0.3; });
    h.tg.position.y=15+Math.sin(t*0.8+1.2)*0.3;
    h.flow.forEach(f=>{
      const u=(t*0.085+f.ph)%1;
      const p=h.tcurve.getPoint(u);
      f.d.position.copy(p);
      f.d.material.opacity=0.9*Math.sin(u*Math.PI);
    });
  }
},8);

/* ---------------------- 09 CLOSE ---------------------- */
slide({
  kick:'THE MANDATE',
  h1:'Every published story builds permanent institutional authority',
  hp:'The faculty moves beyond simulating media practice. It begins operating as an active press house.',
  cam:{d:104,h:36,y:20},
  build(h){
    const g=h.g;
    const globe=new THREE.Group();
    globe.position.set(0,28,0);
    add(globe,new THREE.SphereGeometry(22,48,32),std({color:0x0C1230,roughness:.32,metalness:.45,emissive:0x16295C,emissiveIntensity:.6}));
    wireGlobe(globe,22.2,0x8FA0E8,0.30);
    ringLines(globe,27,INDIGO,0.20,3);
    g.add(globe);
    h.globe=globe;

    const egm=add(globe,egyptGeo(0.19,0.3),glow({color:RED,opacity:1}));
    egm.position.set(3.0,9.6,15.6);
    egm.rotation.set(0.3,0.2,0);
    h.egm=egm;
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.35,2.2,26,20,1,true),glow({color:RED,opacity:0.11}));
    beam.position.set(3.0,23,15.6);
    g.add(beam);
    h.beam=beam;
    const eglab=new Panel(15,3.4,{bg:'rgba(237,31,44,0.94)',border:'rgba(255,255,255,0.35)'});
    eglab.set([{t:'BUE FCMM · CAIRO',s:0.80,w:700,c:'#fff',a:'center'}]);
    eglab.at(g,-19,33,20);
    h.eglab=eglab.mesh;

    const PAL=[0xED1F2C,0x2B3C92,0xE7B84B,0x5FD08A,0x8FA0E8,0xF2F5FA,0xC77BC0];
    const N=2600;
    const pos=new Float32Array(N*3), col=new Float32Array(N*3);
    const dir=new Float32Array(N*3), spd=new Float32Array(N), sw=new Float32Array(N);
    const o=new THREE.Vector3(3.0,9.6,15.6);
    const c=new THREE.Color();
    for(let i=0;i<N;i++){
      const u=Math.random()*2-1, th=Math.random()*TAU, s=Math.sqrt(1-u*u);
      const dx=s*Math.cos(th), dy=s*Math.sin(th), dz=u;
      const l=Math.hypot(dx,dy,dz)||1;
      dir[i*3]=dx/l; dir[i*3+1]=dy/l; dir[i*3+2]=dz/l;
      spd[i]=rnd(0.7,1.5);
      sw[i]=rnd(0.2,1.1);
      c.setHex(PAL[Math.floor(Math.random()*PAL.length)]);
      c.toArray(col,i*3);
    }
    const pgeo=new THREE.BufferGeometry();
    pgeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    pgeo.setAttribute('color',new THREE.BufferAttribute(col,3));
    const pmat=new THREE.PointsMaterial({size:1.05,map:dotTex(),vertexColors:true,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,alphaTest:0.02});
    pmat.userData.base=0.9;
    h.mats.push(pmat);
    const pts=new THREE.Points(pgeo,pmat);
    pts.frustumCulled=false;
    g.add(pts);
    h.pts=pts; h.pdata={pos,dir,spd,sw,o,N};

    /* finale confetti: red-gold-ivory ribbons erupting from the globe */
    {
      const CP=420;
      const cpos=new Float32Array(CP*3), ccol=new Float32Array(CP*3), cph=new Float32Array(CP);
      const cdir=new Float32Array(CP*3), cvy=new Float32Array(CP);
      const CRED=new THREE.Color(0xED1F2C), CGOLD=new THREE.Color(0xE7B84B), CIV=new THREE.Color(0xF2F5FA);
      for(let i=0;i<CP;i++){
        const u=Math.random()*2-1, th=Math.random()*TAU, s=Math.sqrt(1-u*u);
        cdir[i*3]=s*Math.cos(th); cdir[i*3+1]=Math.abs(s*Math.sin(th))*0.7+0.35; cdir[i*3+2]=u;
        const L=Math.hypot(cdir[i*3],cdir[i*3+1],cdir[i*3+2])||1;
        cdir[i*3]/=L; cdir[i*3+1]/=L; cdir[i*3+2]/=L;
        cph[i]=Math.random()*1.6;
        cvy[i]=rnd(6,15);
        const cc=[CRED,CGOLD,CIV][i%3];
        ccol[i*3]=cc.r; ccol[i*3+1]=cc.g; ccol[i*3+2]=cc.b;
      }
      const cgeo=new THREE.BufferGeometry();
      cgeo.setAttribute('position',new THREE.BufferAttribute(cpos,3));
      cgeo.setAttribute('color',new THREE.BufferAttribute(ccol,3));
      const cmat=new THREE.PointsMaterial({size:1.35,map:dotTex(),vertexColors:true,transparent:true,opacity:0.95,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,alphaTest:0.02});
      cmat.userData.base=0.95;
      h.mats.push(cmat);
      const cpt=new THREE.Points(cgeo,cmat);
      cpt.frustumCulled=false;
      g.add(cpt);
      h.conf={cpt,pos:cpos,dir:cdir,vy:cvy,ph:cph,N:CP,anchor:o,center:new THREE.Vector3(3.0,37.6,15.6)};
    }

    for(let i=0;i<9;i++){
      const a1=rnd(0,TAU);
      const p0=o.clone();
      const p2=new THREE.Vector3(Math.cos(a1)*22,28+Math.sin(a1)*15,Math.sin(a1)*22);
      const mid=p0.clone().lerp(p2,0.5);
      mid.y+=rnd(8,24);
      const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(p0,mid,p2),40,0.20,6,false),glow({color:i%2?INDIGO:RED,opacity:0.5}));
      g.add(tube);
    }

    g.add(stageBase(54,0xED1F2C));

    const title=new Panel(46,13,{bg:'rgba(4,4,9,0.88)',border:'rgba(255,255,255,0.16)'});
    title.set([
      {t:'BUE FCMM',s:2.5,w:800,c:C_WHITE,a:'center'},
      {t:'A faculty that publishes',s:0.98,w:500,c:C_RED,a:'center',sp:0.24}
    ]);
    title.at(g,0,4.6,28);
    h.title=title.mesh;

    const kpi=new Panel(46,5.4,{bg:'rgba(4,4,9,0.82)',border:'rgba(255,255,255,0.14)'});
    kpi.set([{t:'30% international enrollment      ·      100 industry partners      ·      Syndicated MENA coverage',s:0.88,w:600,c:C_WHITE,a:'center'}]);
    kpi.at(g,0,2.0,28);
    h.kpi=kpi.mesh;
  },
  update(h,l,t){
    const d=h.pdata, gx=h.globe.position;
    /* confetti particle physics: launch on entry, gentle fall + drift */
    {
      const cf=h.conf;
      if(l<0.3) cf.on=false;   /* relaunch when the slide is revisited */
      const on=l>0.6;
      cf.cpt.visible=on;
      if(on){
        for(let i=0;i<cf.N;i++){
          const i3=i*3;
          if(!cf.on){
            cf.pos[i3]=cf.center.x+cf.dir[i3]*2;
            cf.pos[i3+1]=cf.center.y+cf.dir[i3+1]*2;
            cf.pos[i3+2]=cf.center.z+cf.dir[i3+2]*2;
            cf.vy[i]=rnd(12,24);
          } else {
            cf.vy[i]-=0.157;                    /* gravity per frame @60fps */
            cf.pos[i3]+=cf.dir[i3]*0.045;
            cf.pos[i3+1]+=cf.vy[i]*0.016;
            cf.pos[i3+2]+=cf.dir[i3+2]*0.045;
            if(cf.pos[i3+1]<0.4){ cf.pos[i3+1]=0.4; cf.vy[i]=0; }
            const wob=Math.sin(t*2.1+cf.ph[i])*0.06;
            cf.pos[i3]+=wob; cf.pos[i3+2]+=wob;
          }
        }
        cf.cpt.geometry.attributes.position.needsUpdate=true;
        const fade=Math.max(0,1-(l-9.0)/2.0);
        cf.cpt.material.opacity=0.95*Math.min(1,fade);
      }
      cf.on=on;
    }
    for(let i=0;i<d.N;i++){
      const i3=i*3;
      const age=((t*0.16*d.spd[i]+d.sw[i])%1.6);
      const dist=age*age*23;
      const wob=Math.sin(t*0.7+d.sw[i]*6)*age*2.2;
      d.pos[i3]=gx.x+d.o.x+d.dir[i3]*dist;
      d.pos[i3+1]=gx.y+d.o.y+d.dir[i3+1]*dist+wob*0.5;
      d.pos[i3+2]=gx.z+d.o.z+d.dir[i3+2]*dist;
    }
    h.pts.geometry.attributes.position.needsUpdate=true;
    h.globe.rotation.y=t*0.075;
    h.egm.rotation.z=t*0.3;
    h.beam.material.userData.base=0.09+0.05*Math.sin(t*1.6);
    h.beam.material.opacity=h.beam.material.userData.base;
    h.eglab.position.y=33+Math.sin(t*0.8)*0.5;
    h.title.position.y=4.6+Math.sin(t*0.5)*0.35;
    h.kpi.position.y=2.0+Math.sin(t*0.5+1.1)*0.3;
  }
},9);

/* ---------------------------- ENGINE ---------------------------- */
const camPos=new THREE.Vector3(), camLook=new THREE.Vector3();
const fromPos=new THREE.Vector3(), fromLook=new THREE.Vector3();
const toPos=new THREE.Vector3(), toLook=new THREE.Vector3(), ctrl=new THREE.Vector3();
const DUR=2.3;
const flash=(()=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({color:0xC9D2FF,transparent:true,opacity:0,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.position.z=-8; m.renderOrder=999;
  camera.add(m);
  return m;
})();

function updateHud(){
  const d=SLIDES[to].def;
  elKick.textContent=d.kick;
  elH1.textContent=d.h1;
  elHp.textContent=d.hp;
  elNum.innerHTML='<b>'+String(to+1).padStart(2,'0')+'</b> / '+String(SLIDES.length).padStart(2,'0');
  elProg.style.width=((to+1)/SLIDES.length*100)+'%';
  Array.prototype.forEach.call(elNav.children,(b,i)=>b.setAttribute('aria-current',i===to?'true':'false'));
}
function goTo(i){
  if(tr<1) return;
  if(i===to) return;
  /* HUD slide-out/in choreography */
  const head=document.getElementById('head');
  if(head){
    head.classList.add('out');
    clearTimeout(goTo._t);
    goTo._t=setTimeout(()=>{ updateHud(); head.classList.remove('out'); },240);
  } else updateHud();
  from=to; to=i; tr=0;
  SLIDES[to].local=0;
  const a=camFor(from), b=camFor(to);
  fromPos.copy(a.p); fromLook.copy(a.l);
  toPos.copy(b.p); toLook.copy(b.l);
  ctrl.copy(a.p).lerp(b.p,0.5);
  ctrl.y=Math.max(a.p.y,b.p.y)+11;
  updateHud();
}

SLIDES.forEach((s,i)=>{
  const b=document.createElement('button');
  b.setAttribute('aria-label','Go to slide '+(i+1));
  b.addEventListener('click',()=>goTo(i));
  elNav.appendChild(b);
  s.g.visible=(i===0);
});
const c0=camFor(0);
camPos.copy(c0.p); camLook.copy(c0.l);
toPos.copy(c0.p); toLook.copy(c0.l);
for(let i=0;i<SLIDES.length;i++) setFade(SLIDES[i],i===0?1:0);
updateHud();

addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){ e.preventDefault(); goTo(Math.min(SLIDES.length-1,to+1)); }
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){ e.preventDefault(); goTo(Math.max(0,to-1)); }
  else if(e.key==='Home'){ goTo(0); }
  else if(e.key==='End'){ goTo(SLIDES.length-1); }
  else if(e.key==='f'||e.key==='F'){
    const btn=document.getElementById('fsBtn');
    if(btn) btn.click();
  }
});
let tx=0,ty=0;
addEventListener('pointermove',e=>{ tx=e.clientX/innerWidth-0.5; ty=e.clientY/innerHeight-0.5; });
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  POST.resize();
});
/* fullscreen toggle */
(function(){
  const btn=document.getElementById('fsBtn');
  if(!btn) return;
  btn.addEventListener('click',()=>{
    if(document.fullscreenElement){ document.exitFullscreen&&document.exitFullscreen(); }
    else if(document.documentElement.requestFullscreen){ document.documentElement.requestFullscreen(); }
  });
  const sync=()=>{ btn.textContent=document.fullscreenElement?'⤡':'⛶'; };
  document.addEventListener('fullscreenchange',sync); sync();
})();

let last=performance.now()/1000, T0=last;
function tick(){
  requestAnimationFrame(tick);
  const now=performance.now()/1000;
  const raw=now-last;
  const dt=Math.min(0.05,raw);
  const rdt=Math.min(0.30,raw);
  last=now;
  const T=now-T0;

  if(tr<1){
    tr=Math.min(1,tr+rdt/DUR);
    const e=easeIO(tr), o=1-e;
    camPos.set(
      o*o*fromPos.x+2*o*e*ctrl.x+e*e*toPos.x,
      o*o*fromPos.y+2*o*e*ctrl.y+e*e*toPos.y,
      o*o*fromPos.z+2*o*e*ctrl.z+e*e*toPos.z
    );
    camLook.lerpVectors(fromLook,toLook,e);
    setFade(SLIDES[from],1-clamp(tr/0.58,0,1));
    setFade(SLIDES[to],clamp((tr-0.30)/0.70,0,1));
    SLIDES[from].g.visible=tr<0.60;
    SLIDES[to].g.visible=true;
    camera.lookAt(camLook);
    camera.rotation.z+=Math.sin(tr*Math.PI)*0.055;
    flash.material.opacity=Math.sin(tr*Math.PI)*0.16;
    POST.pulse=1-easeIO(tr);
    if(tr>=1){ flash.material.opacity=0; POST.pulse=0; }
  } else {
    const c=camFor(to);
    const bob=Math.sin(T*0.22)*1.6;
    camPos.set(c.p.x+tx*5.2,c.p.y+bob-ty*3.0,c.p.z);
    camLook.set(c.l.x+tx*2.0,c.l.y,c.l.z);
    camera.lookAt(camLook);
    camera.rotation.z+=Math.sin(T*0.18)*0.008;
    flash.material.opacity=0;
  }
  camera.position.copy(camPos);

  for(let i=0;i<SLIDES.length;i++){
    const s=SLIDES[i];
    if(!s.g.visible) continue;
    s.local+=rdt;
    if(s.def.update) s.def.update(s.h,s.local,T,dt);
  }
  POST.render(T);
}
window.__BOOTED__=true;
/* reveal letterbox frame once first frame is live */
requestAnimationFrame(()=>document.body.classList.add('show'));
tick();

setTimeout(()=>{
  const l=document.getElementById('load');
  if(l){ l.classList.add('hide'); setTimeout(()=>l.remove(),900); }
},900);
setTimeout(()=>{ const e=document.getElementById('hint'); if(e) e.classList.add('gone'); },7000);
