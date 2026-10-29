import { isEmpty, resetRect, type CellRect, type PaintLayer } from './layer.ts';
import { coverRect } from './roughness.ts';
import { PAINT_FS, QUAD_VS, WALL_FS } from './shaders.ts';
import type { Renderer } from './renderer.ts';

function compile(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const prog = gl.createProgram();
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
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, internal, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };

  const upload = (tex: WebGLTexture, stride: number, r: CellRect, type: number, data: ArrayBufferView) => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, stride);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, r.x0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, r.y0);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1, gl.RED, type, data);
  };

  const free = (g: GpuLayer) => {
    gl.deleteTexture(g.film);
    gl.deleteTexture(g.pool);
    gl.deleteTexture(g.mist);
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
      const c = { x0: Math.max(0, r.x0), y0: Math.max(0, r.y0), x1: Math.min(L.fw - 1, r.x1), y1: Math.min(L.fh - 1, r.y1) };
      upload(g.film, L.fw, c, gl.FLOAT, L.film);
      upload(g.pool, L.fw, c, gl.FLOAT, L.pooled);
      resetRect(r);
    }
    if (!isEmpty(L.mistDirty)) {
      upload(g.mist, L.mw, L.mistDirty, gl.UNSIGNED_BYTE, L.mist);
      resetRect(L.mistDirty);
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
    resize(cssW, cssH) {
      view = { w: cssW, h: cssH };
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
      free(g);
      gpu.delete(L.id);
    },
    destroy() {
      for (const g of gpu.values()) free(g);
      gpu.clear();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
