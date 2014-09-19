precision mediump float;
// this is base on http://http.developer.nvidia.com/GPUGems3/gpugems3_ch03.html
attribute  vec3 baseVert;
attribute  vec3 baseNormal;
attribute  vec3 poseVert1;
attribute  vec3 poseNormal1;
attribute  vec3 poseVert2;
attribute  vec3 poseNormal2;

// transform matrix values
uniform mat4 MVP;
uniform mat3 normalMatrix;
uniform mat4 MV;
uniform float weight1;
uniform float weight2;
varying vec3 position;
varying vec3 normal;

void main()
{
	// first we computer the weighted normal
	vec3  finalN=baseNormal+(weight1*poseNormal1)+(weight2*poseNormal2);
	// then normalize and mult by normal matrix for shading
	normal = normalize( normalMatrix * finalN);
	// now calculate the eye cord position for the frag stage
	// now calculated the weighted vertices and add to the base mesh
	vec3  finalP=baseVert+(weight1*poseVert1)+(weight2*poseVert2);
	position = vec3(MV * vec4(finalP,1.0));
	// Convert position to clip coordinates and pass along
	gl_Position = MVP*vec4(finalP,1.0);
}









