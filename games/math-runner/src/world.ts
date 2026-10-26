import type { Lane, Obstacle } from "./rules";

export interface WorldState { lane: Lane; progress: number; obstacle: Obstacle; resolved: boolean; jump: number; distance: number; time: number; boosted: boolean }
const NEAR = .1, FAR = 100, FOCAL = 1.75;
/** Fixed chase camera: world coordinates, projection and collision share lane centres. */
export function laneX(lane: Lane) { return (lane - 1) * 1.9; }
export function projectPoint(x: number, y: number, z: number, width: number, height: number) {
  const dy = y - 5, dz = z - 9, depth = -(dy * .2545 + dz * .9671);
  return { x: width / 2 + x * FOCAL / depth * height / 2, y: height / 2 - (dy * .9671 - dz * .2545) * FOCAL / depth * height / 2, depth };
}
export function jumpHeight(now: number, until: number) {
  const phase = 1 - (until - now) / 720;
  return phase > 0 && phase < 1 ? Math.sin(phase * Math.PI) * 1.65 : 0;
}
type Colour = readonly [number, number, number];
const ink: Colour = [.12,.25,.32], cream: Colour = [1,.94,.77], coral: Colour = [.94,.36,.29], mint: Colour = [.40,.77,.64], gold: Colour = [1,.75,.28];
const faces = [
  { n: .72, p: [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]] },
  { n: .58, p: [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]] },
  { n: .65, p: [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]] },
  { n: .85, p: [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]] },
  { n: 1, p: [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]] },
  { n: .5, p: [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]] }
];

/** Original low-poly scenery; one dynamic vertex buffer, no models or network requests. */
export class RunnerWorld {
  private gl: WebGLRenderingContext | null;
  private program?: WebGLProgram;
  private buffer?: WebGLBuffer;
  private fallback?: CanvasRenderingContext2D | null;
  private vertices: number[] = [];
  private visualLane = 0;
  private lost = false;
  private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  constructor(private canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext("webgl", { alpha: false, antialias: true, powerPreference: "low-power" });
    if (!this.gl) { this.fallback = canvas.getContext("2d"); canvas.dataset.renderer = "software-3d"; return; }
    this.initGL();
    canvas.dataset.renderer = "webgl-3d";
    canvas.addEventListener("webglcontextlost", event => { event.preventDefault(); this.lost = true; });
    canvas.addEventListener("webglcontextrestored", () => { this.lost = false; this.initGL(); });
  }
  private initGL() {
    const gl = this.gl!;
    const shader = (type: number, source: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error("3D shader compilation failed");
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `attribute vec3 position; attribute vec3 colour; uniform float aspect; varying vec3 tint;
      void main(){ vec3 p=position-vec3(0.,5.,9.); float d=-(p.y*.2545+p.z*.9671);
      gl_Position=vec4(position.x*${FOCAL}/aspect,(p.y*.9671-p.z*.2545)*${FOCAL},${(FAR+NEAR)/(FAR-NEAR)}*d-${2*FAR*NEAR/(FAR-NEAR)},d);
      tint=mix(colour,vec3(.72,.87,.89),clamp((d-18.)/60.,0.,.7)); }`));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, "precision mediump float; varying vec3 tint; void main(){gl_FragColor=vec4(tint,1.);}"));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error("3D shader linking failed");
    this.program = program; this.buffer = gl.createBuffer()!;
    gl.enable(gl.DEPTH_TEST); gl.clearColor(.72,.87,.89,1);
  }
  private box(x: number, y: number, z: number, w: number, h: number, d: number, colour: Colour, angle = 0) {
    const c = Math.cos(angle), s = Math.sin(angle);
    for (const face of faces) for (const i of [0,1,2,0,2,3]) {
      const p = face.p[i], px = p[0]*w/2, pz = p[2]*d/2;
      this.vertices.push(x+px*c+pz*s,y+p[1]*h/2,z+pz*c-px*s,colour[0]*face.n,colour[1]*face.n,colour[2]*face.n);
    }
  }
  render(state: WorldState) {
    const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
    if (!width || !height || this.lost) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    if (this.canvas.width !== Math.round(width*dpr) || this.canvas.height !== Math.round(height*dpr)) { this.canvas.width=Math.round(width*dpr); this.canvas.height=Math.round(height*dpr); }
    this.vertices.length = 0;
    const b = this.box.bind(this), offset = state.distance % 6;
    b(0,-.24,-25,90,.3,90,[.58,.75,.59]);
    b(0,-.06,-23,6.2,.16,64,ink);
    // Oversized toy clouds, a floating balloon and a finish arch give the skyline a silhouette.
    for (const side of [-1,1]) for (let i=0;i<3;i++) b(side*(9+i*.8),7+(i%2)*.4,-36-i*.3,2,1,1.3,cream);
    b(8,6,-22,1.5,1.7,1.5,coral,.6); b(8,4.9,-22,.55,.4,.55,gold);
    b(0,4.5,-48,11,.7,.8,gold); b(-5.2,2,-48,.7,5,.8,coral); b(5.2,2,-48,.7,5,.8,mint);
    for (const side of [-1,1]) {
      b(side*3.2,.02,-23,.18,.18,64,cream);
      b(side*3.65,-.03,-23,.65,.2,64,[.76,.69,.56]);
    }
    for (let i=0;i<12;i++) {
      const z = 6-i*6+offset;
      for (const x of [-.95,.95]) b(x,.035,z,.07,.025,2.3,cream);
      for (const side of [-1,1]) {
        b(side*3.3,.08,z,.25,.12,2,i%2?coral:cream);
        const x=side*(5.5+(i%3)*.7), colour=[coral,mint,gold][i%3];
        if (i%3===0) {
          b(x,.55,z,.22,1.1,.22,[.48,.31,.21]); b(x,1.65,z,1.15,1.35,1.15,mint,.3);
          b(x,2.38,z,.7,.3,.7,gold,.5);
        } else {
          const h=1.6+(i%4)*.5;
          b(x,h/2,z,1.6,h,1.8,colour); b(x,h+.13,z,1.9,.26,2.1,cream);
          for (const dx of [-.42,.42]) { b(x+dx,1.05,z+ .915,.35,.45,.04,cream); b(x+dx,.52,z+.915,.35,.35,.04,ink); }
          b(x,h+.52,z,.5,.5,.5,colour,.5);
          if(i%2===0) { b(x,h+.88,z,.06,.6,.06,ink); b(x,h+1.1,z,.85,.10,.18,gold,this.reducedMotion.matches?0:state.time*.001); }
        }
      }
    }
    // Gate and obstacle approach on the same z-axis as the avatar's feet (z=2).
    const gateZ=2-(1-state.progress)*32;
    for (const lane of [0,1,2] as const) {
      const x=laneX(lane), colour=[gold,mint,coral][lane];
      b(x-.82,1.25,gateZ,.09,2.5,.12,colour);b(x+.82,1.25,gateZ,.09,2.5,.12,colour);b(x,2.5,gateZ,1.75,.15,.15,colour);
      b(x,.055,gateZ,1.65,.05,.45,colour);
    }
    if (!state.resolved && state.progress>.06) {
      const x=laneX(state.obstacle.lane), z=2-(.6-state.progress)*32;
      if (state.obstacle.kind==="hurdle") {
        b(x-.65,.38,z,.16,.76,.3,cream);b(x+.65,.38,z,.16,.76,.3,cream);
        b(x,.68,z,1.55,.22,.28,gold);
        for(const dx of [-.5,0,.5]) b(x+dx,.68,z+.15,.16,.22,.02,ink);
      } else {
        b(x,.7,z,1.55,1.4,.6,coral);
        for(const dx of [-.5,0,.5]) b(x+dx,.7,z+.31,.18,.85,.03,cream);
        b(x,1.48,z,1.7,.16,.75,gold);
      }
    }
    this.visualLane += (laneX(state.lane)-this.visualLane)*.3;
    const x=this.visualLane, jump=state.jump, stride=Math.sin(state.time*.021)*.23, bob=jump>0?0:Math.abs(stride)*.18;
    b(x,.025,2,1,.025,.65,[.08,.18,.22]);
    const y=jump+bob;
    for (const side of [-1,1]) {
      b(x+side*.24,y+.18,2+side*stride,.35,.32,.55,ink);
      b(x+side*.53,y+.72,2-side*stride,.21,.6,.24,coral);
      b(x+side*.29,y+1.58,2,.22,.52,.26,gold,side*.2);
    }
    b(x,y+.74,2,.85,.95,.65,coral); b(x,y+1.15,2,.98,.67,.7,coral);
    b(x,y+.78,2.39,.64,.56,.18,mint); b(x,y+.8,2.5,.22,.20,.045,cream);
    if(state.boosted) for(let i=0;i<6;i++) b(x+(i%2?-.45:.45),.15+(i%3)*.2,2.6+i*.4,.12,.12,.28,gold);
    this.draw(width,height);
  }
  private draw(width: number,height: number) {
    const gl = this.gl;
    if (gl) {
      gl.viewport(0,0,this.canvas.width,this.canvas.height); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.program!); gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer!);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.vertices),gl.DYNAMIC_DRAW);
      for(const [name,offset] of [["position",0],["colour",12]] as const){const location=gl.getAttribLocation(this.program!,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,24,offset);}
      gl.uniform1f(gl.getUniformLocation(this.program!,"aspect"),width/height);
      gl.drawArrays(gl.TRIANGLES,0,this.vertices.length/6);
    } else if (this.fallback) {
      const ctx=this.fallback;ctx.setTransform(this.canvas.width/width,0,0,this.canvas.height/height,0,0);ctx.fillStyle="#b8dee3";ctx.fillRect(0,0,width,height);
      const triangles=[];
      for(let i=0;i<this.vertices.length;i+=18){const v=this.vertices;const p=[0,6,12].map(n=>projectPoint(v[i+n],v[i+n+1],v[i+n+2],width,height));if(p.every(a=>a.depth>NEAR))triangles.push({p,depth:p.reduce((a,b)=>a+b.depth,0),colour:`rgb(${v[i+3]*255},${v[i+4]*255},${v[i+5]*255})`});}
      triangles.sort((a,b)=>b.depth-a.depth);
      for(const {p,colour} of triangles){ctx.fillStyle=colour;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath();ctx.fill();}
    }
  }
}
