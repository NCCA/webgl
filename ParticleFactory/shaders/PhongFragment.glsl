precision mediump float;
/// @brief[in] the vertex normal
varying vec3 fragmentNormal;
/// @brief our output fragment colour
// @brief light structure
struct Lights
{
  vec4 position;
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;
  float spotCosCutoff;
  float spotCosInnerCutoff;
  float spotExponent;
  float constantAttenuation;
  float linearAttenuation;
  float quadraticAttenuation;
};


uniform vec4 Colour;

uniform Lights light;

void main ()
{
  // set the output colour to black
  gl_FragColor= vec4(0.);
  // normalize the vertex normal
  vec3 N = normalize(fragmentNormal);
  // The Light source vector
  // get the Light vector
  vec3 L = normalize(light.position.xyz);
  // calculate diffuse based on Lambert's law (L.N)
  gl_FragColor += Colour  *light.diffuse *dot(L, N);

}


