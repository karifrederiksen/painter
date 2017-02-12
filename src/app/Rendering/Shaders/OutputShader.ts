/// <reference path="Common.ts"/>

/*

	The final shader that the canvas is put through before being displayed.

	All color on the canvas should be in linear color space for better blending,
		so it needs to be converted to gamma before being displayed.

	If necessary, the shader can be expanded later on.

*/
module TSPainter.Rendering {

	const SHADER_OUTPUT_SHADER_VERT = [
		"precision highp float;",

		"attribute vec2 aPosition;",
		"attribute vec2 aTextureCoord;",

		"uniform vec2 uResolution;",

		"varying vec2 vTextureCoord;",

		"void main() {",
		"	vTextureCoord = aTextureCoord / uResolution;",
		"   vec2 csCoord = (aPosition / uResolution) * 2.0 - 1.0;",
		"	gl_Position = vec4(csCoord, 0.0, 1.0);",
		"}"
	].join("\n");

	// Note: function allows us to hardcode the gamma value for better optimization. 
	// Requires recompiling shader every time gamma is changed.
	const SHADER_OUTPUT_SHADER_FRAG = (gamma: number) => {
		return [
			"precision highp float;",

			"varying vec2 vTextureCoord;",

			"uniform sampler2D uTexture;",

			"void main() {",
			"	vec4 pixel = texture2D(uTexture, vTextureCoord);",
			//"   pixel = mix(pixel, vec4(0.0, 0.0, 1.0, 1.0), 0.5);",
			"	gl_FragColor = pow(pixel, vec4(" + (1 / gamma).toFixed(6) + "));",
			"}"
		].join("\n")
	};


	export class OutputShader extends Shader {
		protected _texture: Texture;
		protected _gamma: number;

		constructor(renderer: Renderer, gamma: number, texture: Texture = null) {
			super(renderer, SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(gamma),
				{
					aPosition: new Attribute(renderer.gl.FLOAT, 2),
					aTextureCoord: new Attribute(renderer.gl.FLOAT, 2)
				},
				{
					uTexture: new Uniform("t", texture),
					uResolution: new Uniform("2f", new Vec2())
				},
				2
			);
			this._gamma = gamma;
			this._texture = texture;
		}


		public setTexture(texture: Texture) {
			this.uniforms["uTexture"].value = texture;
			this._texture = texture;
		}
		public getTexture() {
			return this._texture;
		}


		public setGamma(renderer: Renderer, gamma: number) {
			if (true === this._recompileProgram(SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(gamma))) {
				this._gamma = gamma;
			}
		}
		public getGamma() {
			return this._gamma;
		}
		


		public setResolution(width: number, height: number) {
			this.uniforms["uResolution"].value.x = width;
			this.uniforms["uResolution"].value.y = height;
		}
		public getResolution = (): Vec2 => this.uniforms["uResolution"].value;
	}
}