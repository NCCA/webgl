precision mediump float;
/// modified from the OpenGL Shading Language Example "Orange Book"
/// Roost 2002

varying vec4 Colour;
// for mac we need this
//uniform sampler2DShadow ShadowMap;
// for windows unix we need
uniform sampler2D ShadowMap;

varying vec4 ShadowCoord;


void main ()
{
  float shadeFactor=texture2DProj(ShadowMap,ShadowCoord).x;
        shadeFactor=shadeFactor;// * 0.25 + 0.75;
  gl_FragColor=vec4(1.0);//shadeFactor * Colour.rgb, Colour.a);
}
