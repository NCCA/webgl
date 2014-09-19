precision mediump float;
/// @brief the vertex passed in
attribute vec3 inVert;
/// @brief the in uv
attribute vec2 inUV;
/// @brief the normal passed in
attribute vec3 inNormal;
// Bone data
attribute vec4 BoneIDs;
attribute vec4  Weights;

//const int MAX_BONES = 100;
#define MAX_BONES 100
uniform mat4 MVP;
uniform mat4 M;
uniform mat4 MV;

uniform mat4 gBones[MAX_BONES];
varying vec2 texCoord;
varying vec3 outNormal;
varying vec3 worldPosition;
// the eye position of the camera
uniform vec3 viewerPos;
/// @brief the current fragment normal for the vert being processed
varying vec3 fragmentNormal;
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
// array of lights
uniform Lights light;
// direction of the lights used for shading
varying vec3 lightDir;
// out the blinn half vector
varying vec3 halfVector;
varying vec3 eyeDirection;
varying vec3 vPosition;

void main()
{
	 mediump int id0=int(BoneIDs[0]);
	 mediump int id1=int(BoneIDs[1]);
	 mediump int id2=int(BoneIDs[2]);
	 mediump int id3=int(BoneIDs[3]);

	 mat4 BoneTransform = gBones[id0] * Weights[0];
	 BoneTransform     += gBones[id1] * Weights[1];
	 BoneTransform     += gBones[id2] * Weights[2];
	 BoneTransform     += gBones[id3] * Weights[3];
	 vec4 pos   = BoneTransform*vec4(inVert, 1.0);
	 gl_Position    = MVP * pos;

	 texCoord = inUV;
	 vec4 Normal   = BoneTransform * vec4(inNormal, 0.0);
	 fragmentNormal   = normalize((M * Normal).xyz);


	 vec4 worldPosition = M * vec4(inVert, 1.0);
	 eyeDirection = normalize(viewerPos - worldPosition.xyz);
	 // Get vertex position in eye coordinates
	 // Transform the vertex to eye co-ordinates for frag shader
	 /// @brief the vertex in eye co-ordinates  homogeneous
	 vec4 eyeCord=MV*pos;

	 vPosition = eyeCord.xyz / eyeCord.w;

	 float dist;

	 lightDir=vec3(light.position.xyz-eyeCord.xyz);
	 dist = length(lightDir);
	 lightDir/= dist;
	 halfVector = normalize(eyeDirection + lightDir);




}
