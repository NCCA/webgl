precision mediump float;
/// @brief flag to indicate if model has unit normals if not normalize
uniform bool Normalize;
/// @brief the current fragment normal for the vert being processed
varying vec3 fragmentNormal;
// the eye position of the camera
uniform vec3 viewerPos;
/// @brief the vertex passed in
attribute vec3 inVert;
/// @brief the normal passed in
attribute vec3 inNormal;
/// @brief the in uv
attribute vec2 inUV;
varying vec3 eyeDirection;
struct Materials
{
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	float shininess;
};


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
// our material
uniform Materials material;
#define numLights 8
// array of lights
uniform Lights light[numLights];
// direction of the lights used for shading
varying vec3 lightDir[numLights];
// direction of the lights used for shading
varying vec3 halfVector[numLights];

uniform mat4 M;
uniform mat4 MV;
uniform mat4 MVP;
uniform mat3 normalMatrix;

void main()
{
 // calculate the fragments surface normal
 fragmentNormal = (normalMatrix*inNormal);

 if (Normalize == true)
 {
	fragmentNormal = normalize(fragmentNormal);
 }

 // calculate the vertex position
 gl_Position = MVP*vec4(inVert,1.0);
 // Transform the vertex to eye co-ordinates for frag shader
 /// @brief the vertex in eye co-ordinates  homogeneous
vec4 eyeCord=MV*vec4(inVert,1);

vec4 worldPosition = M * vec4(inVert, 1.0);
eyeDirection = normalize(viewerPos - worldPosition.xyz);
float dist;

 for(int i=0; i<numLights; ++i)
 {
	 lightDir[i]=vec3(light[i].position.xyz-eyeCord.xyz);
	 dist = length(lightDir[i]);
	 lightDir[i]/= dist;
	 halfVector[i] = normalize(eyeDirection + lightDir[i]);
 }

}
