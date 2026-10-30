import { isEmpty, resetRectangle, type CellRectangle, type PaintLayer } from './layer.ts';
import { coverRectangle } from './cover.ts';
import { PAINT_FRAGMENT_SHADER, QUAD_VERTEX_SHADER, WALL_FRAGMENT_SHADER } from './shaders.ts';
import type { Renderer } from './renderer.ts';

function compile(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader error');
    gl.attachShader(program, shader);
  }
  gl.bindAttribLocation(program, 0, 'aPos');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link error');
  return program;
}

type GpuLayer = { film: WebGLTexture; pool: WebGLTexture; mist: WebGLTexture };

export function createGLRenderer(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: true });
  if (!gl) throw new Error('WebGL2 unavailable');
  const wallProgram = compile(gl, QUAD_VERTEX_SHADER, WALL_FRAGMENT_SHADER);
  const paintProgram = compile(gl, QUAD_VERTEX_SHADER, PAINT_FRAGMENT_SHADER);
  const uniformsOf = (program: WebGLProgram) => (name: string) => gl.getUniformLocation(program, name);
  const wallUniform = uniformsOf(wallProgram);
  const paintUniform = uniformsOf(paintProgram);

  const vertexArray = gl.createVertexArray();
  gl.bindVertexArray(vertexArray);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let wallTexture: WebGLTexture | null = null;
  let wallSize = { width: 1, height: 1 };
  let view = { width: 1, height: 1 };
  const gpu = new Map<number, GpuLayer>();

  const makeTexture = (internalFormat: number, width: number, height: number) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, internalFormat, width, height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  };

  const upload = (texture: WebGLTexture, stride: number, rectangle: CellRectangle, type: number, data: ArrayBufferView) => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, stride);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, rectangle.x0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, rectangle.y0);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, rectangle.x0, rectangle.y0, rectangle.x1 - rectangle.x0 + 1, rectangle.y1 - rectangle.y0 + 1, gl.RED, type, data);
  };

  const free = (textures: GpuLayer) => {
    gl.deleteTexture(textures.film);
    gl.deleteTexture(textures.pool);
    gl.deleteTexture(textures.mist);
  };

  const sync = (layer: PaintLayer) => {
    let textures = gpu.get(layer.id);
    if (!textures) {
      textures = {
        film: makeTexture(gl.R16F, layer.filmWidth, layer.filmHeight),
        pool: makeTexture(gl.R16F, layer.filmWidth, layer.filmHeight),
        mist: makeTexture(gl.R8, layer.mistWidth, layer.mistHeight),
      };
      gpu.set(layer.id, textures);
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (!isEmpty(layer.filmDirty)) {
      const dirty = layer.filmDirty;
      const clamped = { x0: Math.max(0, dirty.x0), y0: Math.max(0, dirty.y0), x1: Math.min(layer.filmWidth - 1, dirty.x1), y1: Math.min(layer.filmHeight - 1, dirty.y1) };
      upload(textures.film, layer.filmWidth, clamped, gl.FLOAT, layer.film);
      upload(textures.pool, layer.filmWidth, clamped, gl.FLOAT, layer.pooled);
      resetRectangle(dirty);
    }
    if (!isEmpty(layer.mistDirty)) {
      upload(textures.mist, layer.mistWidth, layer.mistDirty, gl.UNSIGNED_BYTE, layer.mist);
      resetRectangle(layer.mistDirty);
    }
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
    return textures;
  };

  const coverArea = () => {
    const rectangle = coverRectangle(wallSize.width, wallSize.height, view.width, view.height);
    return [rectangle.x / view.width, rectangle.y / view.height, rectangle.width / view.width, rectangle.height / view.height] as const;
  };

  return {
    resize(cssWidth, cssHeight) {
      view = { width: cssWidth, height: cssHeight };
    },
    setWall(image) {
      wallTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, wallTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      wallSize = { width: image.naturalWidth, height: image.naturalHeight };
    },
    render(layers) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.05, 0.05, 0.06, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(vertexArray);
      if (!wallTexture) return;
      const cover = coverArea();

      gl.disable(gl.BLEND);
      gl.useProgram(wallProgram);
      gl.uniform4f(wallUniform('uRect'), 0, 0, view.width, view.height);
      gl.uniform2f(wallUniform('uView'), view.width, view.height);
      gl.uniform4f(wallUniform('uCover'), ...cover);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, wallTexture);
      gl.uniform1i(wallUniform('uWall'), 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(paintProgram);
      gl.uniform2f(paintUniform('uView'), view.width, view.height);
      gl.uniform4f(paintUniform('uCover'), ...cover);
      gl.uniform1i(paintUniform('uWall'), 0);
      gl.uniform1i(paintUniform('uFilm'), 1);
      gl.uniform1i(paintUniform('uMist'), 2);
      gl.uniform1i(paintUniform('uPool'), 3);
      for (const layer of layers) {
        const textures = sync(layer);
        if (layer.opacity <= 0) continue;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures.film);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, textures.mist);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, textures.pool);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, wallTexture);
        gl.uniform4f(paintUniform('uRect'), layer.bounds.x, layer.bounds.y, layer.bounds.width, layer.bounds.height);
        gl.uniform3f(paintUniform('uColor'), ...layer.shownColor());
        gl.uniform1f(paintUniform('uOpacity'), layer.opacity);
        gl.uniform1f(paintUniform('uGloss'), layer.gloss);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    },
    release(layer) {
      const textures = gpu.get(layer.id);
      if (!textures) return;
      free(textures);
      gpu.delete(layer.id);
    },
    destroy() {
      for (const textures of gpu.values()) free(textures);
      gpu.clear();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
