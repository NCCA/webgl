precision mediump float;
/// modified from the OpenGL Shading Language Example "Orange Book"
/// Roost 2002

uniform mat4 MV;
uniform mat4 MVP;
uniform mat3 normalMatrix;
uniform mat4 textureMatrix;
uniform vec3 LightPosition;
uniform vec4  inColour;


attribute  vec4  inVert;
attribute vec2 inUV;
attribute  vec3  inNormal;
varying vec4  ShadowCoord;
varying vec4  Colour;
void main()
{
	vec4 ecPosition = MV * inVert;
	vec3 ecPosition3 = (vec3(ecPosition)) / ecPosition.w;
	vec3 VP = LightPosition - ecPosition3;
	VP = normalize(VP);
	vec3 normal = normalize(normalMatrix * inNormal);
	float diffuse = max(0.0, dot(normal, VP));
	vec4 texCoord = textureMatrix * inVert;
	ShadowCoord   = texCoord;
	Colour  = vec4(diffuse * inColour.rgb, inColour.a);
	gl_Position    = MVP * inVert;
}

