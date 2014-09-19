precision mediump float;

/// @brief[in] the vertex normal
varying vec3 fragmentNormal;

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
		vec3 direction;
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
// @param material passed from our program
uniform Materials material;
/// @param lights passed from our program
#define numLights 8

uniform Lights light[numLights];
// our vertex position calculated in vert shader
varying vec3 vPosition;


void main(void)
{
	gl_FragColor=vec4(0.1);
// loop for all the lights and add spotlight values
for (int i = 0; i < numLights; ++i)
{

	float nDotVP;       // normal * light direction
	float nDotR;        // normal * light reflection vector
	float pf=0.0;           // power factor
	float spotDot;      // cosine of angle between spotlight
	float spotAttenuation;     // spotlight attenuation factor;
	float attenuation;  // computed attenuation factor
	float d;            // distance from surface to light position
	vec3 VP;            // direction from surface to light position
	vec3 reflection;    // direction of maximum highlights

	// Compute vector from surface to light position
	VP = vec3 (light[i].position) - vPosition;

	// Compute distance between surface and light position
	d = length (VP);

	// Normalize the vector from surface to light position
	VP = normalize (VP);

	// Compute attenuation
	attenuation = 1.0 / (light[i].constantAttenuation +
											 light[i].linearAttenuation * d +
											 light[i].quadraticAttenuation * d * d);

	// See if point on surface is inside cone of illumination
	spotDot = dot (-VP, normalize (light[i].direction));

	if (spotDot < light[i].spotCosCutoff)
	{
			spotAttenuation = 0.0;
	}
	else
	{
			// we are going to ramp from the outer cone value to the inner using
			// smoothstep to create a smooth value for the falloff
			float spotValue=smoothstep(light[i].spotCosCutoff,light[i].spotCosInnerCutoff,spotDot);
			spotAttenuation = pow (spotValue, light[i].spotExponent);
	}

	// Combine the spot and distance attenuation
	attenuation *= spotAttenuation;
	// calc the reflection for the highlight
	reflection = normalize (reflect (-normalize (VP), normalize(fragmentNormal)));

	nDotVP = max (0.0, dot (fragmentNormal, VP));
	nDotR = max (0.0, dot (normalize (fragmentNormal), reflection));
// the clamp code below is the same as this but removes the branch which is quicker
//    if (nDotVP == 0.f)
//        pf = 0.f;
//    else
//        pf = pow (nDotR, material.shininess);
	pf=clamp(nDotVP,0.0,pow (nDotR, material.shininess));
	// combine the light / material values
	vec4 ambient = material.ambient * light[i].ambient * attenuation;
	vec4 diffuse = material.diffuse * light[i].diffuse * nDotVP * attenuation;
	vec4 specular = material.specular * light[i].specular * pf * attenuation;

	gl_FragColor+= ambient + diffuse + specular;

}
}


