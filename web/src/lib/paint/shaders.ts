export const QUAD_VS = `#version 300 es
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

export const WALL_FS = `#version 300 es
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

export const PAINT_FS = `#version 300 es
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
