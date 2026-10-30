export const QUAD_VERTEX_SHADER = `#version 300 es
in vec2 aPos;
uniform vec4 uRect;
uniform vec2 uView;
out vec2 vUv;
out vec2 vScreen;
void main() {
  vUv = aPos;
  vec2 pixel = uRect.xy + aPos * uRect.zw;
  vScreen = pixel / uView;
  gl_Position = vec4(vScreen.x * 2.0 - 1.0, 1.0 - vScreen.y * 2.0, 0.0, 1.0);
}`;

export const WALL_FRAGMENT_SHADER = `#version 300 es
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

export const PAINT_FRAGMENT_SHADER = `#version 300 es
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

float hash(vec2 point) {
  point = fract(point * vec2(123.34, 456.21));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}
float valueNoise(vec2 point) {
  vec2 cell = floor(point), fraction = fract(point);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);
  return mix(mix(hash(cell), hash(cell + vec2(1, 0)), fraction.x), mix(hash(cell + vec2(0, 1)), hash(cell + vec2(1, 1)), fraction.x), fraction.y);
}
float luma(vec3 color) { return dot(color, vec3(0.3, 0.59, 0.11)); }

vec4 cubicWeights(float offset) {
  vec4 distances = vec4(1.0, 2.0, 3.0, 4.0) - offset;
  vec4 cubes = distances * distances * distances;
  float x = cubes.x;
  float y = cubes.y - 4.0 * cubes.x;
  float z = cubes.z - 4.0 * cubes.y + 6.0 * cubes.x;
  return vec4(x, y, z, 6.0 - x - y - z) / 6.0;
}
float cubic(sampler2D field, vec2 uv) {
  vec2 size = vec2(textureSize(field, 0));
  uv = uv * size - 0.5;
  vec2 fraction = fract(uv);
  uv -= fraction;
  vec4 weightsX = cubicWeights(fraction.x);
  vec4 weightsY = cubicWeights(fraction.y);
  vec4 corners = uv.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 sums = vec4(weightsX.xz + weightsX.yw, weightsY.xz + weightsY.yw);
  vec4 offsets = (corners + vec4(weightsX.yw, weightsY.yw) / sums) / size.xxyy;
  float blendX = sums.x / (sums.x + sums.y);
  float blendY = sums.z / (sums.z + sums.w);
  return mix(
    mix(texture(field, offsets.yw).r, texture(field, offsets.xw).r, blendX),
    mix(texture(field, offsets.yz).r, texture(field, offsets.xz).r, blendX), blendY);
}
float filmAt(vec2 uv) { return cubic(uFilm, uv); }

void main() {
  vec2 texel = 1.0 / vec2(textureSize(uFilm, 0));
  float film = filmAt(vUv);
  float mist = texture(uMist, vUv).r * 1.6;
  float pool = cubic(uPool, vUv);
  float spray = max(film - pool, 0.0);
  vec2 halfTexel = texel * 0.5;
  vec2 gradient = vec2(cubic(uPool, vUv + vec2(halfTexel.x, 0)) - cubic(uPool, vUv - vec2(halfTexel.x, 0)),
                       cubic(uPool, vUv + vec2(0, halfTexel.y)) - cubic(uPool, vUv - vec2(0, halfTexel.y)));

  vec2 screenPixel = vScreen * uView;
  float grain = valueNoise(screenPixel * 1.7) * 0.6 + valueNoise(screenPixel * 3.9) * 0.4;
  float sprayDensity = 1.0 - exp(-3.6 * spray);
  float sprayCover = mix(sprayDensity, smoothstep(grain - 0.1, grain + 0.1, sprayDensity), 0.4 * (1.0 - sprayDensity));
  float mistCover = 1.0 - exp(-2.5 * mist);
  float liquidCover = clamp((pool - 0.1) / max(fwidth(pool), 1e-4) + 0.5, 0.0, 1.0) * 0.97;
  float alpha = 1.0 - (1.0 - sprayCover) * (1.0 - mistCover) * (1.0 - liquidCover);
  float liquid = liquidCover * smoothstep(0.05, 0.3, pool);
  float bead = liquid * smoothstep(0.9, 2.2, pool);

  vec2 wallUv = (vScreen - uCover.xy) / uCover.zw;
  vec3 wall = texture(uWall, wallUv).rgb;
  vec3 wallBlur = textureLod(uWall, wallUv, 4.5).rgb;
  float detail = clamp(luma(wall) / max(luma(wallBlur), 0.02), 0.55, 1.4);

  float thickness = max(smoothstep(0.9, 3.2, film), 0.6 * liquid);
  vec3 color = mix(uColor, uColor * uColor, thickness * 0.3);
  color *= mix(detail, 1.0, 0.35 + 0.65 * thickness);

  vec3 normal = normalize(vec3(-gradient * 0.6 * bead, 1.0));
  vec3 light = normalize(vec3(-0.45, -0.65, 0.75));
  color *= clamp(1.0 + 0.4 * (dot(normal, light) - light.z), 0.9, 1.08);
  vec3 halfVector = normalize(light + vec3(0, 0, 1));
  float specular = pow(max(dot(normal, halfVector), 0.0), 90.0) * uGloss * bead * 0.25;

  float shadow = smoothstep(1.4, 3.5, cubic(uPool, vUv - texel * vec2(0.15, 0.3)));
  float shadowAlpha = shadow * 0.12 * (1.0 - alpha);
  outColor = vec4((color + specular) * alpha, alpha + shadowAlpha) * uOpacity;
}`;
