/*

	The shader for generating the standard brush texture

*/
module TSPainter {

	const SHADER_BRUSH_VERT = [
		"precision highp float;",

		"attribute vec2 aPosition;",

		"varying vec2 vPosition;",

		"void main() {",
		"	vPosition = aPosition;",
		"	gl_Position = vec4(aPosition, 0.0, 1.0);",
		"}"
    ].join("\n");

	const SHADER_BRUSH_FRAG = [
		"precision highp float;",
		
		"varying vec2 vPosition;",
		
		"uniform float uSoftness;",
		"uniform float uGamma;",

		"void main() {",
		// TODO: pass radius as a uniform
		"	float radius = 1.0 - uSoftness;",
		"	float dist = sqrt(dot(vPosition, vPosition));",
		"	float a = 1.0 - smoothstep(radius, radius + uSoftness, dist);",

		"	gl_FragColor = vec4(vec3(0.0), pow(a, uGamma));",
		"}"
	].join("\n");


	export class DefaultBrushShader extends Shader {
		constructor(renderer: Renderer, softness: number) {
			super(renderer, SHADER_BRUSH_VERT, SHADER_BRUSH_FRAG,
				{
					aPosition: new Attribute(renderer.gl.FLOAT, 2)
				},
				{
					uSoftness: new Uniform("1f", Settings.getValue(Settings.ID.BrushSoftness)),
					uGamma: new Uniform("1f", Settings.getValue(Settings.ID.Gamma))
                },
                2
			);

		}

		public softnessChangeCallback = (softness: number) => this.uniforms["uSoftness"].value = softness;
		public gammaChangeCallback = (gamma: number) => this.uniforms["uGamma"].value = gamma;
	}
}