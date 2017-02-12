module TSPainter.Rendering {

    /*
        Variation of smoothstep
    
        https://en.wikipedia.org/wiki/Smoothstep#Variations
    */
	export const SHADER_FUNC_smootherstep = [
		"float smootherstep(float edge0, float edge1, float x) {",
		"	x = clamp((x - edge0)/(edge1 - edge0), 0.0, 1.0);",
		"	return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);",
		"}"
    ].join("\n");


	/*
		GLSL function for converting hsv to rgb.
 
		vec3 hsv2rgb(vec3);
	*/
	export const SHADER_FUNC_hsv2rgb = [
		// TODO: figure out which of the two functions is more correct. They each have slightly different 
		// gradients between primary hues. Sam's looks smoother, so I'm sticking to that for now.
		// https://www.shadertoy.com/view/MsS3Wc - Iñigo Quiles 
		/*'vec3 hsv2rgb(in vec3 c) {',
		'	vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);',
		'	rgb = rgb * rgb * (3.0 - 2.0 * rgb);',
		'	return c.z * mix(vec3(1.0), rgb, c.y);',
		'}',*/
		// http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl - Sam Hocevar
		"vec3 hsv2rgb(vec3 c) {",
		"	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
		"	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
		"	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
		"}",
		"vec4 hsv2rgb(vec4 c) {",
		"	return vec4(hsv2rgb(c.rgb), c.a);",
		"}",
    ].join("\n");


    /*
        GLSL function for converting rgb to hsv.
    
        vec3 rgb2hsv(vec3);
    */
	export const SHADER_FUNC_rgb2hsv = [
		// http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl - Sam Hocevar
		"vec3 rgb2hsv(vec3 c) {",
		"	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);",
		"	vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);",
		"	vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);",
		"	float d = q.x - min(q.w, q.y);",
		"	float e = 1.0e-10;",
		"	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);",
		"}"
    ].join("\n");


	/*
		Defines constants for PI and TAU (2PI)
	*/
	export const SHADER_DEFINE_PI = [
		"\n#ifndef PI",
		"	#define PI 3.14159265359",
		"#endif",
		"#ifndef TAU",
		"	#define TAU 6.283185307179586",
		"#endif\n"
    ].join("\n");


	/*
		RNG
	*/
	export const SHADER_FUNC_rand = [
		"float rand(float n) {",
		"	return fract(sin(n) * 43758.5453123);",
		"}",
		"float rand(vec2 n) {",
		"	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);",
		"}",
    ].join("\n");


	/*
		pow with vectors
	*/
	export const SHADER_FUNC_pow = [
		"vec2 pow(vec2 vec, float power) {",
		"	return vec2(pow(vec.x, power), pow(vec.y, power));",
		"}",
		"vec3 pow(vec3 vec, float power) {",
		"	return vec3(pow(vec.x, power), pow(vec.y, power), pow(vec.z, power));",
		"}",
		"vec4 pow(vec4 vec, float power) {",
		"	return vec4(pow(vec.x, power), pow(vec.y, power), pow(vec.z, power), pow(vec.w, power));",
		"}",
    ].join("\n");


	/*
		Converts from rgb to greyscale using the values found here
		http://alienryderflex.com/hsp.html
    
		Basic: humans see certain hues more clearly, so simply averaging the rgb values doesn't
		generate a good greyscale. For example in HSV, a fully saturated blue is significantly
		darker than a fully saturated green, and yet if you convert them to greyscale by averaging,
		they will both generate the same tone.
    
		We need to take our human brightness perception into account. To do this we assign r, g,
		and b, separate multipliers that correspond with how brightly we perceive them. These
		multipliers add up to a total of 1.0.
    
		r * 0.299
		g * 0.587
		b * 0.114
 
	*/
	export const SHADER_FUNC_toGreyscale = [
		"float toGreyscale( in vec3 color ) {",
		"	return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;",
		"}",
		"vec3 toGreyscale( in vec3 color ) {",
		"	return vec3(toGreyscale(color));",
		"}",
		"vec4 toGreyscale( in vec4 color ) {",
		"	return vec4(toGreyscale(color.rgb), color.a);",
		"}",
    ].join("\n");


	/*
		Previously used this to generator my cursor outline.
 
		https://en.wikipedia.org/wiki/Sobel_operator#Alternative_operators
	*/
	export const SHADER_FUNC_sobelOperator = [
		"float sobelOperator() {",
		"	float alpha = 0.0;",
		// top
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	-stepSize.y)).a * 3.0;",
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(0.0,			-stepSize.y)).a * 10.0;",
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	-stepSize.y)).a * 3.0;",
		// middle
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	0.0)).a * 10.0;",
		"	alpha += texture2D(uSampler, vTextureCoord + vec2(0.0,			0.0)).a * 52.0;",
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	0.0)).a * 10.0;",
		// bottom
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	stepSize.y)).a * 3.0;",
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(0.0,			stepSize.y)).a * 10.0;",
		"	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	stepSize.y)).a * 3.0;",
		"	return alpha;",
		"}",
    ].join("\n");
}