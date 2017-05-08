import { ShaderBase, Attribute, Uniform, AttributeMap, UniformMap } from "./Shader";
import { Renderer } from "../Renderer";

/*

	The shader for generating the standard brush texture

*/
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

export interface BrushShaderAttributes extends AttributeMap {
	aPosition: Attribute;
}

export interface BrushShaderUniforms extends UniformMap {
	uSoftness: Uniform<"1f">;
	uGamma: Uniform<"1f">;
}

export class DefaultBrushShader extends ShaderBase<BrushShaderAttributes, BrushShaderUniforms> {

	public name = "brush shader";

	public set softness(texture: number) {
		this.uniforms.uSoftness.value = texture;
	}
	public get softness() {
		return this.uniforms.uSoftness.value;
	}

	public set gamma(texture: number) {
		this.uniforms.uGamma.value = texture;
	}
	public get gamma() {
		return this.uniforms.uGamma.value;
	}


	constructor(renderer: Renderer, softness: number, gamma: number) {
		super(renderer, SHADER_BRUSH_VERT, SHADER_BRUSH_FRAG,
			{
				aPosition: new Attribute(renderer.gl.FLOAT, 2)
			},
			{
				uSoftness: new Uniform("1f", softness),
				uGamma: new Uniform("1f", gamma)
			},
			2
		);

	}
}
