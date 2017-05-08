import { ShaderBase, Attribute, Uniform, AttributeMap, UniformMap } from "./Shader";
import { Texture } from "../Texture";
import { Renderer } from "../Renderer";
import { Vec2 } from "../../Math/Vec";


// I don't yet know how I'm going to implement this feature. Currently just copied from drawpointshader



const SHADER_BLUR_SHADER_VERT = [
	"precision highp float;",

	"attribute vec2 aPosition;",
	"attribute vec2 aBrushTextureCoord;",

	"uniform vec2 uResolution;",
	"uniform float uScale;",
	"uniform float uRotation;",

	"varying vec2 vBrushTextureCoord;",
	"varying vec2 vLayerCoord;",

	"void main() {",
	"	vBrushTextureCoord = aBrushTextureCoord / uResolution;",
	"   vec2 csCoord = (aPosition / uResolution) * 2.0 - 1.0;",
	"	vLayerCoord = csCoord;",
	"	gl_Position = vec4(csCoord, 0.0, 1.0);",
	"}"
].join("\n");


const SHADER_BLUR_SHADER_FRAG = [
	"precision highp float;",

	"varying vec2 vLayerCoord;",
	"varying vec2 vBrushTextureCoord;",

	"uniform vec2 uCenter;",
	"uniform sampler2D uLayerTexture;",
	"uniform sampler2D uBrushTexture;",

	"void main() {",
	"	vec4 pixel = texture2D(uBrushTexture, vBrushTextureCoord);",
	//"	pixel = mix(pixel, vec4(0.0, 0.0, 1.0, 1.0), 0.5);",
	"	gl_FragColor = pixel;",
	"}"
].join("\n");

export interface BlurShaderAttributes extends AttributeMap {
	aPosition: Attribute;
	aTextureCoord: Attribute;
}

export interface BlurShaderUniforms extends UniformMap {
	uBrushTexture: Uniform<"t">;
	uLayerTexture: Uniform<"t">;
	uResolution: Uniform<"2f">;
	uScale: Uniform<"1f">;
	uRotation: Uniform<"1f">;
}

export class BlurShader extends ShaderBase<BlurShaderAttributes, BlurShaderUniforms> {

	public name = "Blur shader";

	public get layerTexture(): Texture {
		return this.uniforms.uLayerTexture.value;
	}
	public set layerTexture(value: Texture) {
		this.uniforms.uLayerTexture.value = value;
	}

	public get brushTexture(): Texture {
		return this.uniforms.uBrushTexture.value;
	}
	public set brushTexture(value: Texture) {
		this.uniforms.uBrushTexture.value = value;
	}

	public get scale(): number {
		return this.uniforms.uScale.value;
	}
	public set scale(value: number) {
		this.uniforms.uScale.value = value;
	}

	public get rotation(): number {
		return this.uniforms.uRotation.value;
	}
	public set rotation(value: number) {
		this.uniforms.uRotation.value = value;
	}


	public get resolution(): Vec2 {
		return this.uniforms.uResolution.value;
	}
	public set resolution(value: Vec2) {
		this.uniforms.uResolution.value = value;
	}

	public constructor(renderer: Renderer, resolution: Vec2) {
		super(renderer, SHADER_BLUR_SHADER_VERT, SHADER_BLUR_SHADER_FRAG,
			{
				aPosition: new Attribute(renderer.gl.FLOAT, 2),
				aTextureCoord: new Attribute(renderer.gl.FLOAT, 2)
			},
			{
				uBrushTexture: new Uniform("t", null),
				uLayerTexture: new Uniform("t", null),
				uResolution: new Uniform("2f", resolution),
				uScale: new Uniform("1f", 1),
				uRotation: new Uniform("1f", 0)
			},
			2
		);
	}
}
