import { ShaderBase, Attribute, Uniform, AttributeMap, UniformMap } from "./Shader";
import { Texture } from "../Texture";
import { Renderer } from "../Renderer";
import { Vec2 } from "../../Math/Vec";

/*

	The final shader that the canvas is put through before being displayed.

	All color on the canvas should be in linear color space for better blending,
		so it needs to be converted to gamma before being displayed.

	If necessary, the shader can be expanded later on.

*/
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
function SHADER_OUTPUT_SHADER_FRAG(gamma: number) {
	console.assert(isNaN(gamma) === false, "Gamma expected to be numeric.");

	let fragColor: string;
	if (gamma === 1) {
		fragColor = "pixel";
		console.info(`Gamma is ${gamma}. Not transforming color.`)
	}
	else if (gamma === 2) {
		fragColor = "sqrt(pixel)"
		console.info(`Gamma is ${gamma}. Transforming color using: ${fragColor}`)
	}
	else {
		const gammaStr = (1 / gamma).toFixed(6);
		fragColor = `pow(pixel, vec4(${gammaStr}))`;
		console.info(`Gamma is ${gamma}. Transforming color using: ${fragColor}`);
	}
	return [
		"precision highp float;",

		"varying vec2 vTextureCoord;",

		"uniform sampler2D uTexture;",

		"void main() {",
		"	vec4 pixel = texture2D(uTexture, vTextureCoord);",
		//"   pixel = mix(pixel, vec4(0.0, 0.0, 1.0, 1.0), 0.5);",
		`	gl_FragColor = ${fragColor};`,
		"}"
	].join("\n");
};


export interface OutputShaderAttributes extends AttributeMap {
	aPosition: Attribute;
	aTextureCoord: Attribute;
}

export interface OutputShaderUniforms extends UniformMap {
	uTexture: Uniform<"t">;
	uResolution: Uniform<"2f">;
}

export class OutputShader extends ShaderBase<OutputShaderAttributes, OutputShaderUniforms> {
	protected _gamma: number;

	public name = "output shader";


	public get gamma() {
		return this._gamma;
	}
	public set gamma(value: number) {
		if (true === this._recompileProgram(SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(value))) {
			this._gamma = value;
		}
	}

	public get texture(): Texture {
		return this.uniforms.uTexture.value;
	}
	public set texture(value: Texture) {
		this.uniforms.uTexture.value = value;
	}


	public get resolution(): Vec2 {
		return this.uniforms.uResolution.value;
	}
	public set resolution(value: Vec2) {
		this.uniforms.uResolution.value = value;
	}


	constructor(renderer: Renderer, resolution: Vec2, gamma: number, texture: Texture = null) {
		super(renderer, SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(gamma),
			{
				aPosition: new Attribute(renderer.gl.FLOAT, 2),
				aTextureCoord: new Attribute(renderer.gl.FLOAT, 2)
			},
			{
				uTexture: new Uniform("t", texture),
				uResolution: new Uniform("2f", resolution)
			},
			2
		);
		this._gamma = gamma;
	}
}