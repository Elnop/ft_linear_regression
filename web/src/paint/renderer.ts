import { isEmpty, resetRect, type PaintLayer } from './layer.ts';
import { coverRect } from './roughness.ts';

export type Renderer = {
  resize(cssW: number, cssH: number, dpr: number): void;
  setWall(img: HTMLImageElement): void;
  render(layers: PaintLayer[]): void;
  release(layer: PaintLayer): void;
  destroy(): void;
};

const QUAD_VS = `#version 300 es
in vec2 aPos;
uniform vec4 uRect;
uniform vec2 uView;
out vec2 vUv;
out vec2 vScreen;
void main() {
  vUv = aPos;
  vec2 p = uRect.xy + aPos * uRect.zw;
  vScreen = p / uView;
  gl_Position = vec4(vScreen.x * 2.0 - 1.0, 1.0 - vScreen.y * 2.0, 0.0, 1.0);
}`;

const WALL_FS = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vScreen;
uniform sampler2D uWall;
uniform vec4 uCover;
out vec4 outColor;
void main() {
  vec2 uv = (vScreen - uCover.xy) / uCover.zw;
  outColor = vec4(texture(uWall, uv).rgb, 1.0);
}`;

const PAINT_FS = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vScreen;
uniform sampler2D uFilm;
uniform sampler2D uMist;
uniform sampler2D uPool;
uniform sampler2D uWall;
uniform vec4 uCover;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uGloss;
uniform vec2 uView;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float luma(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }

vec4 cubicWeights(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 s = n * n * n;
  float x = s.x;
  float y = s.y - 4.0 * s.x;
  float z = s.z - 4.0 * s.y + 6.0 * s.x;
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;
}
float cubic(sampler2D tex, vec2 uv) {
  vec2 size = vec2(textureSize(tex, 0));
  uv = uv * size - 0.5;
  vec2 f = fract(uv);
  uv -= f;
  vec4 xc = cubicWeights(f.x);
  vec4 yc = cubicWeights(f.y);
  vec4 c = uv.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 s = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 o = (c + vec4(xc.yw, yc.yw) / s) / size.xxyy;
  float sx = s.x / (s.x + s.y);
  float sy = s.z / (s.z + s.w);
  return mix(
    mix(texture(tex, o.yw).r, texture(tex, o.xw).r, sx),
    mix(texture(tex, o.yz).r, texture(tex, o.xz).r, sx), sy);
}
float filmAt(vec2 uv) { return cubic(uFilm, uv); }

void main() {
  vec2 px = 1.0 / vec2(textureSize(uFilm, 0));
  float film = filmAt(vUv);
  float mist = texture(uMist, vUv).r * 1.6;
  float pool = cubic(uPool, vUv);
  float spray = max(film - pool, 0.0);
  vec2 e = px * 0.5;
  vec2 grad = vec2(cubic(uPool, vUv + vec2(e.x, 0)) - cubic(uPool, vUv - vec2(e.x, 0)),
                   cubic(uPool, vUv + vec2(0, e.y)) - cubic(uPool, vUv - vec2(0, e.y)));

  vec2 sp = vScreen * uView;
  float n = vnoise(sp * 1.7) * 0.6 + vnoise(sp * 3.9) * 0.4;
  float c = 1.0 - exp(-3.6 * spray);
  float sprayCover = mix(c, smoothstep(n - 0.1, n + 0.1, c), 0.4 * (1.0 - c));
  float mistCover = 1.0 - exp(-2.5 * mist);
  float liquidCover = clamp((pool - 0.1) / max(fwidth(pool), 1e-4) + 0.5, 0.0, 1.0) * 0.97;
  float a = 1.0 - (1.0 - sprayCover) * (1.0 - mistCover) * (1.0 - liquidCover);
  float liquid = liquidCover * smoothstep(0.05, 0.3, pool);
  float bead = liquid * smoothstep(0.9, 2.2, pool);

  vec2 wuv = (vScreen - uCover.xy) / uCover.zw;
  vec3 wall = texture(uWall, wuv).rgb;
  vec3 wallBlur = textureLod(uWall, wuv, 4.5).rgb;
  float detail = clamp(luma(wall) / max(luma(wallBlur), 0.02), 0.55, 1.4);

  float thick = max(smoothstep(0.9, 3.2, film), 0.6 * liquid);
  vec3 col = mix(uColor, uColor * uColor, thick * 0.3);
  col *= mix(detail, 1.0, 0.35 + 0.65 * thick);

  vec3 nrm = normalize(vec3(-grad * 0.6 * bead, 1.0));
  vec3 l = normalize(vec3(-0.45, -0.65, 0.75));
  col *= clamp(1.0 + 0.4 * (dot(nrm, l) - l.z), 0.9, 1.08);
  vec3 hv = normalize(l + vec3(0, 0, 1));
  float spec = pow(max(dot(nrm, hv), 0.0), 90.0) * uGloss * bead * 0.25;

  float shadow = smoothstep(1.4, 3.5, cubic(uPool, vUv - px * vec2(0.15, 0.3)));
  float sa = shadow * 0.12 * (1.0 - a);
  outColor = vec4((col + spec) * a, a + sa) * uOpacity;
}`;

function compile(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const prog = gl.createProgram()!;
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader error');
    gl.attachShader(prog, sh);
  }
  gl.bindAttribLocation(prog, 0, 'aPos');
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link error');
  return prog;
}

type GpuLayer = { film: WebGLTexture; pool: WebGLTexture; mist: WebGLTexture };

export function createGLRenderer(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: true });
  if (!gl) throw new Error('WebGL2 unavailable');
  const wallProg = compile(gl, QUAD_VS, WALL_FS);
  const paintProg = compile(gl, QUAD_VS, PAINT_FS);
  const uni = (p: WebGLProgram) => (name: string) => gl.getUniformLocation(p, name);
  const wu = uni(wallProg);
  const pu = uni(paintProg);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let wallTex: WebGLTexture | null = null;
  let wallSize = { w: 1, h: 1 };
  let view = { w: 1, h: 1 };
  const gpu = new Map<number, GpuLayer>();

  const makeTex = (internal: number, w: number, h: number) => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, internal, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };

  const sync = (L: PaintLayer) => {
    let g = gpu.get(L.id);
    if (!g) {
      g = { film: makeTex(gl.R16F, L.fw, L.fh), pool: makeTex(gl.R16F, L.fw, L.fh), mist: makeTex(gl.R8, L.mw, L.mh) };
      gpu.set(L.id, g);
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (!isEmpty(L.filmDirty)) {
      const r = L.filmDirty;
      const x0 = Math.max(0, r.x0), y0 = Math.max(0, r.y0);
      const x1 = Math.min(L.fw - 1, r.x1), y1 = Math.min(L.fh - 1, r.y1);
      gl.bindTexture(gl.TEXTURE_2D, g.film);
      gl.pixelStorei(gl.UNPACK_ROW_LENGTH, L.fw);
      gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, x0);
      gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y0);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1, gl.RED, gl.FLOAT, L.film);
      gl.bindTexture(gl.TEXTURE_2D, g.pool);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1, gl.RED, gl.FLOAT, L.pooled);
      resetRect(r);
    }
    if (!isEmpty(L.mistDirty)) {
      const r = L.mistDirty;
      gl.bindTexture(gl.TEXTURE_2D, g.mist);
      gl.pixelStorei(gl.UNPACK_ROW_LENGTH, L.mw);
      gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, r.x0);
      gl.pixelStorei(gl.UNPACK_SKIP_ROWS, r.y0);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1, gl.RED, gl.UNSIGNED_BYTE, L.mist);
      resetRect(r);
    }
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
    return g;
  };

  const cover = () => {
    const c = coverRect(wallSize.w, wallSize.h, view.w, view.h);
    return [c.x / view.w, c.y / view.h, c.w / view.w, c.h / view.h] as const;
  };

  return {
    resize(cssW, cssH, dpr) {
      view = { w: cssW, h: cssH };
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    },
    setWall(img) {
      wallTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, wallTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      wallSize = { w: img.naturalWidth, h: img.naturalHeight };
    },
    render(layers) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.06, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(vao);
      if (!wallTex) return;
      const cv = cover();

      gl.disable(gl.BLEND);
      gl.useProgram(wallProg);
      gl.uniform4f(wu('uRect'), 0, 0, view.w, view.h);
      gl.uniform2f(wu('uView'), view.w, view.h);
      gl.uniform4f(wu('uCover'), ...cv);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, wallTex);
      gl.uniform1i(wu('uWall'), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(paintProg);
      gl.uniform2f(pu('uView'), view.w, view.h);
      gl.uniform4f(pu('uCover'), ...cv);
      gl.uniform1i(pu('uWall'), 0);
      gl.uniform1i(pu('uFilm'), 1);
      gl.uniform1i(pu('uMist'), 2);
      gl.uniform1i(pu('uPool'), 3);
      for (const L of layers) {
        const g = sync(L);
        if (L.opacity <= 0) continue;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, g.film);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, g.mist);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, g.pool);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, wallTex);
        gl.uniform4f(pu('uRect'), L.bounds.x, L.bounds.y, L.bounds.w, L.bounds.h);
        gl.uniform3f(pu('uColor'), ...L.shownColor());
        gl.uniform1f(pu('uOpacity'), L.opacity);
        gl.uniform1f(pu('uGloss'), L.gloss);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    },
    release(L) {
      const g = gpu.get(L.id);
      if (!g) return;
      gl.deleteTexture(g.film);
      gl.deleteTexture(g.pool);
      gl.deleteTexture(g.mist);
      gpu.delete(L.id);
    },
    destroy() {
      for (const g of gpu.values()) gl.deleteTexture(g.film), gl.deleteTexture(g.pool), gl.deleteTexture(g.mist);
      gpu.clear();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
