import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import brandOnen from "@/assets/brand-onen.jpg";
import brandFarak from "@/assets/brand-farak.jpg";
import brandMocha from "@/assets/brand-mocha.jpg";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Our Brands — ISHTILE+" },
      { name: "description", content: "Meet the independent labels shaping the ISHTILE+ universe." },
    ],
  }),
  component: BrandsPage,
});

const slides = [
  {
    name: "ONEN", suffix: "+", title: "A quieter kind of confidence.",
    description: "Clean lines, considered details and everyday pieces made to move with you.",
    image: brandOnen, alt: "ONEN+ campaign portrait", category: "Contemporary essentials",
  },
  {
    name: "FARAK", suffix: "", title: "Made to stand apart.",
    description: "Expressive silhouettes, confident choices and a point of view entirely your own.",
    image: brandFarak, alt: "FARAK fashion campaign portrait", category: "Modern expression",
  },
  {
    name: "MOCHA", suffix: "+", title: "Tradition, with a new rhythm.",
    description: "Thoughtful everyday dressing with a respect for heritage and an eye on what comes next.",
    image: brandMocha, alt: "MOCHA+ campaign portrait", category: "Contemporary heritage",
  },
];

type GL = WebGLRenderingContext;

const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fragmentSource = `
precision highp float;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform vec2 uResolution;
uniform vec2 uFromSize;
uniform vec2 uToSize;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 imageSize) {
  vec2 screen = uResolution;
  float scale = max(screen.x / imageSize.x, screen.y / imageSize.y);
  vec2 shown = imageSize * scale;
  vec2 offset = (screen - shown) * 0.5;
  return (uv * screen - offset) / shown;
}
void main() {
  vec2 uv1 = coverUv(vUv, uFromSize);
  vec2 uv2 = coverUv(vUv, uToSize);
  vec2 pixel = vUv * uResolution;
  vec2 center = uResolution * 0.5;
  float radius = uProgress * length(uResolution) * 0.82;
  float distanceFromCenter = length(pixel - center);
  float edge = 22.0 + 14.0 * sin(uTime * 1.2);
  float reveal = 1.0 - smoothstep(radius - edge, radius + edge, distanceFromCenter);
  vec2 direction = normalize(pixel - center + vec2(0.001));
  float ring = exp(-pow((distanceFromCenter - radius) / max(edge * 0.7, 1.0), 2.0));
  float strength = (1.0 - smoothstep(0.0, 0.95, uProgress)) * ring;
  vec2 distortion = direction * strength * 0.025;
  distortion += vec2(sin(vUv.y * 24.0 + uTime), cos(vUv.x * 22.0 - uTime)) * strength * 0.006;
  vec4 fromColor = texture2D(uFrom, uv1);
  vec4 toColor = texture2D(uTo, uv2 + distortion);
  float chroma = strength * 0.004;
  vec3 refracted = vec3(
    texture2D(uTo, uv2 + distortion + direction * chroma).r,
    toColor.g,
    texture2D(uTo, uv2 + distortion - direction * chroma).b
  );
  vec3 glassColor = mix(fromColor.rgb, refracted, reveal);
  float rim = ring * 0.12 * (1.0 - smoothstep(0.0, 0.08, uProgress));
  glassColor += rim;
  gl_FragColor = vec4(mix(fromColor.rgb, glassColor, reveal), 1.0);
  if (uProgress > 0.995) gl_FragColor = texture2D(uTo, uv2);
}`;

function createShader(gl: GL, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function BrandsPage() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [webglReady, setWebglReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<GL | null>(null);
  const texturesRef = useRef<WebGLTexture[]>([]);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const activeRef = useRef(0);
  const busyRef = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const brand = slides[active];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) { setWebglFailed(true); return; }
    glRef.current = gl;

    let program: WebGLProgram | null = null;
    let frame = 0;
    let disposed = false;
    const started = performance.now();

    try {
      const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
      const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      if (!program) throw new Error("Unable to create WebGL program");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "WebGL link failed");
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const names = ["uFrom", "uTo", "uResolution", "uFromSize", "uToSize", "uProgress", "uTime"];
      uniformsRef.current = Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program!, name)]));
      gl.uniform1i(uniformsRef.current.uFrom, 0);
      gl.uniform1i(uniformsRef.current.uTo, 1);

      const loaded: WebGLTexture[] = [];
      const loadTexture = (src: string) => new Promise<WebGLTexture>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          if (disposed) return;
          const texture = gl.createTexture();
          if (!texture) { reject(new Error("Texture creation failed")); return; }
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          loaded.push(texture);
          resolve(texture);
        };
        image.onerror = () => reject(new Error("Brand image failed to load"));
        image.src = src;
      });

      Promise.all(slides.map((item) => loadTexture(item.image))).then((textures) => {
        if (disposed) { textures.forEach((texture) => gl.deleteTexture(texture)); return; }
        texturesRef.current = textures;
        setWebglReady(true);
        const draw = (now: number) => {
          if (disposed) return;
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
          const pixelWidth = Math.max(1, Math.round(width * dpr));
          const pixelHeight = Math.max(1, Math.round(height * dpr));
          if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth; canvas.height = pixelHeight;
            gl.viewport(0, 0, pixelWidth, pixelHeight);
          }
          gl.useProgram(program);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textures[activeRef.current]);
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textures[(activeRef.current + 1) % textures.length]);
          const from = slides[activeRef.current];
          const to = slides[(activeRef.current + 1) % slides.length];
          gl.uniform2f(uniformsRef.current.uResolution, pixelWidth, pixelHeight);
          gl.uniform2f(uniformsRef.current.uFromSize, 1600, 2000);
          gl.uniform2f(uniformsRef.current.uToSize, 1600, 2000);
          gl.uniform1f(uniformsRef.current.uProgress, 0);
          gl.uniform1f(uniformsRef.current.uTime, (now - started) / 1000);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        void loaded;
      }).catch((error) => { console.error(error); setWebglFailed(true); });
    } catch (error) {
      console.error("Brands WebGL setup failed:", error);
      setWebglFailed(true);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      texturesRef.current.forEach((texture) => gl.deleteTexture(texture));
      texturesRef.current = [];
      if (program) gl.deleteProgram(program);
      glRef.current = null;
    };
  }, []);

  const goTo = useCallback((index: number) => {
    const target = (index + slides.length) % slides.length;
    if (target === activeRef.current || busyRef.current) return;
    busyRef.current = true;
    const gl = glRef.current;
    const textures = texturesRef.current;
    const uniforms = uniformsRef.current;
    const previous = activeRef.current;
    const nextTexture = textures[target];
    const fromTexture = textures[previous];
    const canvas = canvasRef.current;
    if (!gl || !nextTexture || !fromTexture || !canvas) {
      activeRef.current = target;
      setActive(target);
      busyRef.current = false;
      return;
    }

    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fromTexture);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, nextTexture);
    gl.uniform2f(uniforms.uFromSize, 1600, 2000);
    gl.uniform2f(uniforms.uToSize, 1600, 2000);
    const progress = { value: 0 };
    gsap.to(progress, {
      value: 1, duration: 1.8, ease: "power2.inOut",
      onUpdate: () => gl.uniform1f(uniforms.uProgress, progress.value),
      onComplete: () => {
        activeRef.current = target;
        setActive(target);
        gl.uniform1f(uniforms.uProgress, 0);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, nextTexture);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textures[(target + 1) % textures.length]);
        busyRef.current = false;
      },
    });

    if (titleRef.current && descriptionRef.current) {
      gsap.to([titleRef.current, descriptionRef.current], {
        y: -18, opacity: 0, duration: 0.35, stagger: 0.04, ease: "power2.in",
        onComplete: () => {
          setActive(target);
          requestAnimationFrame(() => {
            if (!titleRef.current || !descriptionRef.current) return;
            gsap.fromTo([titleRef.current, descriptionRef.current],
              { y: 22, opacity: 0, filter: "blur(8px)" },
              { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.12, ease: "power3.out" });
          });
        },
      });
    } else setActive(target);
  }, []);

  useEffect(() => {
    if (!playing || !webglReady) return;
    const timer = window.setInterval(() => {
      if (!busyRef.current) goTo(activeRef.current + 1);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [playing, webglReady, goTo]);

  useEffect(() => {
    const el = progressRef.current;
    if (!el || !playing) return;
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 6.5, ease: "none", repeat: -1 });
    return () => { gsap.killTweensOf(el); };
  }, [active, playing]);

  const changeSlide = (index: number) => {
    setPlaying(false);
    goTo(index);
  };

  return (
    <div className="bg-[#171717] text-[#F0EAE0]">
      <main data-header-theme="dark" className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[#171717] md:min-h-[calc(100svh-4.5rem)]">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full min-h-[calc(100svh-4rem)] w-full object-cover md:min-h-[calc(100svh-4.5rem)]" />
        {(!webglReady || webglFailed) && (
          <img src={brand.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#171717]/80 via-[#171717]/25 to-[#171717]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/70 via-transparent to-[#171717]/15" />
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1600px] flex-col px-5 pb-7 pt-8 md:min-h-[calc(100svh-4.5rem)] md:px-10 md:pb-9 md:pt-10">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F0EAE0]/75 md:text-xs">ISHTILE+ / The brand universe</p>
            <span className="hidden text-[10px] uppercase tracking-[0.24em] text-[#F0EAE0]/65 md:block">Independent labels · One point of view</span>
          </div>

          <div className="flex flex-1 items-center py-12 md:py-16">
            <div className="max-w-[760px]">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D5FE00] md:text-xs">{String(active + 1).padStart(2, "0")} / {brand.category}</p>
              <h1 ref={titleRef} className="max-w-[900px] font-display text-[clamp(4.5rem,13vw,12rem)] font-black leading-[0.76] tracking-[-0.09em] text-[#F0EAE0]">
                {brand.name}<span className="text-[#D5FE00]">{brand.suffix}</span>
              </h1>
              <p ref={descriptionRef} className="mt-7 max-w-[560px] font-display text-[clamp(1.35rem,3vw,2.6rem)] font-bold leading-[1.04] tracking-[-0.045em] text-[#D5FE00] md:mt-9">{brand.title}</p>
              <p className="mt-4 max-w-[440px] text-sm leading-[1.75] text-[#F0EAE0]/85 md:text-base">{brand.description}</p>
              <Link to="/shop" className="group mt-7 inline-flex items-center gap-3 border-b border-[#F0EAE0]/65 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F0EAE0] transition-colors hover:border-[#D5FE00] hover:text-[#D5FE00] md:mt-9">
                Explore the label <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>

          <div className="flex items-end justify-between gap-5 border-t border-[#F0EAE0]/30 pt-5 md:pt-6">
            <nav aria-label="Choose a brand" className="flex flex-1 items-end gap-3 md:gap-6">
              {slides.map((item, index) => (
                <button key={item.name} type="button" onClick={() => changeSlide(index)} aria-label={`Show ${item.name}`} aria-current={active === index ? "true" : undefined} className="group flex min-w-0 flex-1 flex-col gap-2 text-left">
                  <span className="h-[2px] w-full overflow-hidden bg-[#F0EAE0]/35">
                    <span className={`block h-full origin-left bg-[#D5FE00] transition-transform duration-300 ${active === index ? "scale-x-100" : "scale-x-0 group-hover:scale-x-40"}`} />
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.13em] md:text-xs md:tracking-[0.18em] ${active === index ? "text-[#D5FE00]" : "text-[#F0EAE0]/70 group-hover:text-white"}`}>{item.name}{item.suffix}</span>
                </button>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
              <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause slideshow" : "Play slideshow"} className="hidden h-9 w-9 place-items-center rounded-full border border-[#F0EAE0]/40 text-[#F0EAE0] hover:border-[#D5FE00] hover:text-[#D5FE00] sm:grid">{playing ? <PauseIcon /> : <PlayIcon />}</button>
              <span className="hidden font-display text-sm font-bold tabular-nums text-[#F0EAE0]/75 sm:block">{String(active + 1).padStart(2, "0")}<span className="px-1.5 text-white/45">/</span>0{slides.length}</span>
              <button type="button" onClick={() => changeSlide(active - 1)} aria-label="Previous brand" className="grid h-9 w-9 place-items-center rounded-full border border-[#F0EAE0]/40 hover:border-[#D5FE00] hover:text-[#D5FE00]"><ArrowLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => changeSlide(active + 1)} aria-label="Next brand" className="grid h-9 w-9 place-items-center rounded-full bg-[#D5FE00] text-[#171717] transition-transform hover:scale-105"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">
            <div ref={progressRef} className="h-full w-full origin-left bg-[#D5FE00]" />
          </div>
        </div>
        {!webglReady && !webglFailed && <span className="sr-only" role="status">Loading brand visuals</span>}
      </main>
      <Footer />
    </div>
  );
}

function PauseIcon() {
  return <span className="flex gap-[3px]"><span className="h-3.5 w-[3px] rounded-sm bg-current" /><span className="h-3.5 w-[3px] rounded-sm bg-current" /></span>;
}
function PlayIcon() {
  return <Play className="h-3.5 w-3.5" />;
}
