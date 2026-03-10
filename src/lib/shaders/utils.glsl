// 📁 src/lib/shaders/utils.glsl
float hash(vec3 p) {
  p = fract(p * 0.3183099 + .1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float fbm(vec3 p) {
  float value = 0.0;
  float scale = 0.5;
  for(int i = 0; i < 5; i++){
    value += scale * hash(p);
    p *= 2.0;
    scale *= 0.5;
  }
  return value;
}
