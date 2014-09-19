precision mediump float;
varying vec3 fragmentNormal;
/// @brief the eye position passed in from main app
uniform vec3 eye;
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
	float quadraticAttenuation;
	float spotCosCutoff;
	float constantAttenuation;
	float linearAttenuation;
};
// @param material passed from our program
uniform Materials material;
/// @param lights passed from our program
#define numLights 3

uniform Lights light[3];
varying vec3 lightDir[3];

varying vec3 halfVector[3];
varying vec3 eyeDirection;



/// @brief a function to compute point light values
/// @param[in] _light the number of the current light
/// @param[in] _normal the current fragmentNormal
/// @param[in,out] _ambient the ambient colour to be contributed to
/// @param[in,out] _diffuse the diffuse colour to be contributed to
/// @param[in,out] _specular the specular colour to be contributed to

/// @brief a function to compute point light values
/// @param[in] _light the number of the current light
/// @param[in] _normal the current fragmentNormal
/// @param[in,out] _ambient the ambient colour to be contributed to
/// @param[in,out] _diffuse the diffuse colour to be contributed to
/// @param[in,out] _specular the specular colour to be contributed to
/*
void pointLight(
								const int i,
								in vec3 _normal,
								inout vec4 _ambient,
								inout vec4 _diffuse,
								inout vec4 _specular
							)
{
	vec3 N = normalize(fragmentNormal);
	vec3 halfV;
	float ndothv;
	vec3 E = normalize(eyeDirection);
	vec3 L = normalize(lightDir[i]);
	float lambertTerm = dot(N,L);
	if (lambertTerm > 0.0)
	{
		_diffuse+=material.diffuse*light[i].diffuse*lambertTerm;
		_ambient+=material.ambient*light[i].ambient;
		halfV = normalize(halfVector[i]);
		ndothv = max(dot(N, halfV), 0.0);
		_specular+=material.specular*light[i].specular*pow(ndothv, material.shininess);
	}


}
*/
void main ()
{

vec4 ambient=vec4(0.0);
vec4 diffuse=vec4(0.0);
vec4 specular=vec4(0.0);

//pointLight(0,fragmentNormal,ambient,diffuse,specular);
//pointLight(1,fragmentNormal,ambient,diffuse,specular);
//pointLight(2,fragmentNormal,ambient,diffuse,specular);
for (int i=0; i<3; ++i)
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

