import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import brandOnen from "@/assets/brand-onen.jpg";
import brandFarak from "@/assets/brand-farak.jpg";
import brandMocha from "@/assets/brand-mocha.jpg";
import "./lumina-interactive-list.css";

declare global { interface Window { THREE?: any; } }
const slides = [
  { name: "ONEN+", title: "A quieter kind of confidence.", description: "Clean lines, considered details and everyday pieces made to move with you.", image: brandOnen },
  { name: "FARAK", title: "Made to stand apart.", description: "Expressive silhouettes, confident choices and a point of view entirely your own.", image: brandFarak },
  { name: "MOCHA+", title: "Tradition, with a new rhythm.", description: "Thoughtful everyday dressing with a respect for heritage and an eye on what comes next.", image: brandMocha },
];
const vertexShader = "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }";
const fragmentShader = [
"uniform sampler2D uTexture1, uTexture2;","uniform float uProgress;","uniform vec2 uResolution, uTexture1Size, uTexture2Size;","varying vec2 vUv;",
"vec2 getCoverUV(vec2 uv, vec2 textureSize){ vec2 s=uResolution/textureSize; float scale=max(s.x,s.y); vec2 scaledSize=textureSize*scale; vec2 offset=(uResolution-scaledSize)*0.5; return (uv*uResolution-offset)/scaledSize; }",
"vec4 glassEffect(vec2 uv,float progress){",
"vec2 uv1=getCoverUV(uv,uTexture1Size); vec2 uv2=getCoverUV(uv,uTexture2Size); float maxR=length(uResolution)*0.85; float br=progress*maxR; vec2 p=uv*uResolution; vec2 c=uResolution*0.5; float d=length(p-c); float nd=d/max(br,0.001); float inside=1.0-smoothstep(br-3.0,br+3.0,d); vec2 dir=d>0.0?(p-c)/d:vec2(0.0);",
"float refraction=0.08*pow(smoothstep(0.3,1.0,nd),1.5); vec2 distorted=uv2-dir*refraction; distorted+=vec2(sin(progress*8.0+nd*10.0),cos(progress*6.0+nd*8.0))*0.015*nd*inside; float ca=0.02*pow(smoothstep(0.3,1.0,nd),1.2);",
"vec4 next=vec4(texture2D(uTexture2,distorted+dir*ca*1.2).r,texture2D(uTexture2,distorted+dir*ca*0.2).g,texture2D(uTexture2,distorted-dir*ca*0.8).b,1.0); float rim=smoothstep(0.95,1.0,nd)*(1.0-smoothstep(1.0,1.01,nd)); next.rgb+=rim*0.08; vec4 old=texture2D(uTexture1,uv1); if(progress>0.95) next=mix(next,texture2D(uTexture2,uv2),(progress-0.95)/0.05); return mix(old,next,inside); }",
"void main(){ gl_FragColor=glassEffect(vUv,uProgress); }"
].join("\n");

function loadThree(){ return new Promise<any>((resolve,reject)=>{ if(window.THREE){resolve(window.THREE);return;} const existing=document.querySelector<HTMLScriptElement>('script[data-ishtile-three]'); if(existing){const started=Date.now();const timer=window.setInterval(()=>{if(window.THREE){clearInterval(timer);resolve(window.THREE);}else if(Date.now()-started>10000){clearInterval(timer);reject(new Error("Three.js load timed out"));}},50);return;} const script=document.createElement("script");script.dataset.ishtileThree="true";script.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";script.onload=()=>window.THREE?resolve(window.THREE):reject(new Error("Three.js did not initialize"));script.onerror=()=>reject(new Error("Could not load Three.js"));document.head.appendChild(script);}); }

export function Component(){
 const canvasRef=useRef<HTMLCanvasElement>(null); const titleRef=useRef<HTMLHeadingElement>(null); const descRef=useRef<HTMLParagraphElement>(null); const progressRef=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0); const [ready,setReady]=useState(false); const activeRef=useRef(0); const busyRef=useRef(false); const changeRef=useRef<(i:number)=>void>(()=>{}); const slide=slides[active];
 useEffect(()=>{
  let disposed=false;let renderer:any;let material:any;let scene:any;let frame=0;let resize:(()=>void)|undefined;let timer=0;const textures:any[]=[];const uniformsRef:{current:any}={current:null};
  const animateText=(index:number)=>{const title=titleRef.current;const desc=descRef.current;if(!title||!desc)return;const chars=Array.from(title.querySelectorAll("span"));gsap.killTweensOf([chars,desc]);gsap.to([chars,desc],{y:-18,opacity:0,duration:.38,stagger:.015,ease:"power2.in",onComplete:()=>{if(disposed)return;setActive(index);requestAnimationFrame(()=>{const nextChars=titleRef.current?.querySelectorAll("span");if(!nextChars||!descRef.current)return;const mode=index%6;const from:any[]=[{y:22},{y:-22},{filter:"blur(10px)",scale:1.4},{scale:0},{rotationX:90,transformOrigin:"50% 50%"},{x:34}];const to:any[]=[{y:0},{y:0},{filter:"blur(0px)",scale:1},{scale:1},{rotationX:0},{x:0}];gsap.fromTo(nextChars,{...from[mode],opacity:0},{...to[mode],opacity:1,duration:.85,stagger:mode===2?{amount:.5,from:"random"}:.035,ease:mode===1||mode===3?"back.out(1.7)":"power3.out"});gsap.fromTo(descRef.current,{y:18,opacity:0},{y:0,opacity:1,duration:.8,delay:.2,ease:"power3.out"});});}});};
  const navigate=(index:number)=>{const target=(index+slides.length)%slides.length;if(target===activeRef.current||busyRef.current||!material||!textures[target])return;busyRef.current=true;const u=uniformsRef.current;const previous=activeRef.current;u.uTexture1.value=textures[previous];u.uTexture2.value=textures[target];u.uTexture1Size.value.set(textures[previous].image.width,textures[previous].image.height);u.uTexture2Size.value.set(textures[target].image.width,textures[target].image.height);const p={value:0};animateText(target);activeRef.current=target;gsap.to(p,{value:1,duration:2.5,ease:"power2.inOut",onUpdate:()=>{u.uProgress.value=p.value;},onComplete:()=>{u.uTexture1.value=textures[target];u.uTexture1Size.value.set(textures[target].image.width,textures[target].image.height);u.uProgress.value=0;busyRef.current=false;}});};
  changeRef.current=navigate;
  const start=async()=>{try{const THREE=await loadThree();if(disposed||!canvasRef.current)return;scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);renderer=new THREE.WebGLRenderer({canvas:canvasRef.current,antialias:false,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));const uniforms={uTexture1:{value:null},uTexture2:{value:null},uProgress:{value:0},uResolution:{value:new THREE.Vector2(1,1)},uTexture1Size:{value:new THREE.Vector2(1,1)},uTexture2Size:{value:new THREE.Vector2(1,1)}};uniformsRef.current=uniforms;material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader});scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));const loader=new THREE.TextureLoader();for(const item of slides){const texture=await new Promise<any>((resolve,reject)=>loader.load(item.image,resolve,undefined,reject));texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;textures.push(texture);}if(disposed)return;uniforms.uTexture1.value=textures[0];uniforms.uTexture2.value=textures[1];uniforms.uTexture1Size.value.set(textures[0].image.width,textures[0].image.height);uniforms.uTexture2Size.value.set(textures[1].image.width,textures[1].image.height);setReady(true);resize=()=>{const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);uniforms.uResolution.value.set(w*renderer.getPixelRatio(),h*renderer.getPixelRatio());};resize();const render=()=>{if(disposed)return;renderer.render(scene,camera);frame=requestAnimationFrame(render);};render();timer=window.setInterval(()=>{if(!document.hidden&&!busyRef.current)navigate((activeRef.current+1)%slides.length);},5000);window.addEventListener("resize",resize);}catch(error){console.error("ISHTILE brand slider could not initialize:",error);}};
  void start();return()=>{disposed=true;window.clearInterval(timer);cancelAnimationFrame(frame);if(resize)window.removeEventListener("resize",resize);textures.forEach(t=>t.dispose());material?.dispose();renderer?.dispose();gsap.killTweensOf([titleRef.current,descRef.current,progressRef.current]);};
 },[]);
 useEffect(()=>{const el=progressRef.current;if(!el)return;gsap.killTweensOf(el);gsap.fromTo(el,{scaleX:0},{scaleX:1,duration:5,ease:"none",repeat:-1});return()=>{gsap.killTweensOf(el);};},[active]);
 return <main className="lumina-brands" data-header-theme="dark">
  <canvas ref={canvasRef} className="lumina-brands__canvas" aria-hidden="true"/>
  {!ready&&<img className="lumina-brands__fallback" src={slide.image} alt=""/>}
  <div className="lumina-brands__shade"/>
  <div className="lumina-brands__topline"><span>ISHTILE+ / THE BRAND UNIVERSE</span><span>INDEPENDENT LABELS · ONE POINT OF VIEW</span></div>
  <section className="lumina-brands__copy" aria-live="polite"><h1 ref={titleRef}>{slide.name.split("").map((char,i)=><span key={i}>{char===" "?"\u00a0":char}</span>)}</h1><p ref={descRef}>{slide.title}</p><span className="lumina-brands__description">{slide.description}</span></section>
  <div className="lumina-brands__bottom"><nav className="lumina-brands__nav" aria-label="Choose a brand">{slides.map((item,i)=><button key={item.name} onClick={()=>changeRef.current(i)} className={active===i?"is-active":""} aria-current={active===i?"true":undefined}><span className="lumina-brands__track"><span/></span><span>{item.name}</span></button>)}</nav><div className="lumina-brands__controls"><span>{String(active+1).padStart(2,"0")} / 0{slides.length}</span><button aria-label="Previous brand" onClick={()=>changeRef.current(active-1)}>←</button><button aria-label="Next brand" onClick={()=>changeRef.current(active+1)}>→</button></div></div>
  <div className="lumina-brands__progress"><div ref={progressRef}/></div>
 </main>;
}
