precision mediump float;
/// @brief the current fragment normal for the vert being processed
varying vec3 fragmentNormal;
/// @brief the vertex passed in
attribute vec3 inVert;
/// @brief the normal passed in
attribute vec3 inNormal;
/// @brief the in uv
attribute vec2 inUV;

// transform matrix values
uniform mat4 MVP;

void main()
{
// calculate the fragments surface normal
 fragmentNormal = inNormal;

 // calculate the vertex position
 gl_Position = MVP*vec4(inVert,1.0);

}






