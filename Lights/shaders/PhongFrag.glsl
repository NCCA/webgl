precision mediump float;
/// @brief[in] the vertex normal
varying vec3 fragmentNormal;
/// @brief the eye position passed in from main app
uniform vec3 eye;
/// @brief our output fragment colour
/// @brief material structure
struct Materials
{
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	float shininess;
};

// @brief light structure
struct Lights
{
	vec4 position;
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	float constantAttenuation;
	float spotCosCutoff;
	float quadraticAttenuation;
	float linearAttenuation;
};
// @param material passed from our program
uniform Materials material;
/// @param lights passed from our program
#define numLights 8

uniform Lights light[numLights];
varying vec3 lightDir[numLights];

varying vec3 halfVector[numLights];
varying vec3 eyeDirection;






void main ()
{

vec4 ambient=vec4(0.0);
vec4 diffuse=vec4(0.0);
vec4 specular=vec4(0.0);

for (int i=0; i<numLights; ++i)
{
		vec3 N = normalize(fragmentNormal);
		vec3 halfV;
		float ndothv;
		vec3 E = normalize(eyeDirection);
		vec3 L = normalize(lightDir[i]);
		float lambertTerm = dot(N,L);
		if (lambertTerm > 0.0)
		{
			diffuse+=material.diffuse*light[i].diffuse*lambertTerm;
			ambient+=material.ambient*light[i].ambient;
			halfV = normalize(halfVector[i]);
			ndothv = max(dot(N, halfV), 0.0);
			specular+=material.specular*light[i].specular*pow(ndothv, material.shininess);
		}
}
gl_FragColor=ambient+diffuse+specular;
}

