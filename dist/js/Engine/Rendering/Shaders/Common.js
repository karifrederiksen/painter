export const SHADER_FUNC_smootherstep = [
    "float smootherstep(float edge0, float edge1, float x) {",
    "	x = clamp((x - edge0)/(edge1 - edge0), 0.0, 1.0);",
    "	return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);",
    "}"
].join("\n");
export const SHADER_FUNC_hsv2rgb = [
    "vec3 hsv2rgb(vec3 c) {",
    "	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",
    "vec4 hsv2rgb(vec4 c) {",
    "	return vec4(hsv2rgb(c.rgb), c.a);",
    "}",
].join("\n");
export const SHADER_FUNC_rgb2hsv = [
    "vec3 rgb2hsv(vec3 c) {",
    "	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);",
    "	vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);",
    "	vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);",
    "	float d = q.x - min(q.w, q.y);",
    "	float e = 1.0e-10;",
    "	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);",
    "}"
].join("\n");
export const SHADER_DEFINE_PI = [
    "\n#ifndef PI",
    "	#define PI 3.14159265359",
    "#endif",
    "#ifndef TAU",
    "	#define TAU 6.283185307179586",
    "#endif\n"
].join("\n");
export const SHADER_FUNC_rand = [
    "float rand(float n) {",
    "	return fract(sin(n) * 43758.5453123);",
    "}",
    "float rand(vec2 n) {",
    "	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);",
    "}",
].join("\n");
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
export const SHADER_FUNC_sobelOperator = [
    "float sobelOperator() {",
    "	float alpha = 0.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	-stepSize.y)).a * 3.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(0.0,			-stepSize.y)).a * 10.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	-stepSize.y)).a * 3.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	0.0)).a * 10.0;",
    "	alpha += texture2D(uSampler, vTextureCoord + vec2(0.0,			0.0)).a * 52.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	0.0)).a * 10.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	stepSize.y)).a * 3.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(0.0,			stepSize.y)).a * 10.0;",
    "	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	stepSize.y)).a * 3.0;",
    "	return alpha;",
    "}",
].join("\n");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJpbmcvU2hhZGVycy9Db21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUEsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUc7SUFDdkMseURBQXlEO0lBQ3pELG9EQUFvRDtJQUNwRCxvREFBb0Q7SUFDcEQsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBUWIsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUc7SUFVbEMsd0JBQXdCO0lBQ3hCLGlEQUFpRDtJQUNqRCxvREFBb0Q7SUFDcEQsNERBQTREO0lBQzVELEdBQUc7SUFDSCx3QkFBd0I7SUFDeEIsb0NBQW9DO0lBQ3BDLEdBQUc7Q0FDSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQVFiLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHO0lBRWxDLHdCQUF3QjtJQUN4QixtREFBbUQ7SUFDbkQsNERBQTREO0lBQzVELDREQUE0RDtJQUM1RCxpQ0FBaUM7SUFDakMscUJBQXFCO0lBQ3JCLDJFQUEyRTtJQUMzRSxHQUFHO0NBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFNYixNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRztJQUMvQixjQUFjO0lBQ2QsMkJBQTJCO0lBQzNCLFFBQVE7SUFDUixhQUFhO0lBQ2IsZ0NBQWdDO0lBQ2hDLFVBQVU7Q0FDVixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQU1iLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHO0lBQy9CLHVCQUF1QjtJQUN2Qix3Q0FBd0M7SUFDeEMsR0FBRztJQUNILHNCQUFzQjtJQUN0QixpRUFBaUU7SUFDakUsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBTWIsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHO0lBQzlCLG1DQUFtQztJQUNuQyxxREFBcUQ7SUFDckQsR0FBRztJQUNILG1DQUFtQztJQUNuQyx3RUFBd0U7SUFDeEUsR0FBRztJQUNILG1DQUFtQztJQUNuQywyRkFBMkY7SUFDM0YsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBcUJiLE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHO0lBQ3RDLHNDQUFzQztJQUN0Qyw4REFBOEQ7SUFDOUQsR0FBRztJQUNILHFDQUFxQztJQUNyQyxtQ0FBbUM7SUFDbkMsR0FBRztJQUNILHFDQUFxQztJQUNyQyxnREFBZ0Q7SUFDaEQsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBUWIsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUc7SUFDeEMseUJBQXlCO0lBQ3pCLHFCQUFxQjtJQUVyQix3RkFBd0Y7SUFDeEYsbUZBQW1GO0lBQ25GLHVGQUF1RjtJQUV2RixpRkFBaUY7SUFDakYsMkVBQTJFO0lBQzNFLGdGQUFnRjtJQUVoRix1RkFBdUY7SUFDdkYsa0ZBQWtGO0lBQ2xGLHNGQUFzRjtJQUN0RixnQkFBZ0I7SUFDaEIsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDIn0=