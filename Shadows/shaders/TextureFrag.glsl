precision mediump float;
// this is a pointer to the current 2D texture object
uniform sampler2D tex;
// the vertex UV
varying vec2 vertUV;
void main ()
{
 // set the fragment colour to the current texture
 gl_FragColor = vec4(texture2D(tex,vertUV).r);
}
