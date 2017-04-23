import { Shader, Attribute, Uniform } from "./Shader";
import { Texture } from "../Texture";
import { Renderer } from "../Renderer";
import { Vec2 } from "../../Math/Vec";

/*
	Used for Texture objects
*/
const SHADER_SPRITE_SHADER_VERT = [
	"precision highp float;",

	"attribute vec2 aPosition;",
	"attribute vec2 aTextureCoord;",

	"uniform vec2 uResolution;",
	"uniform float uScale;",
	"uniform float uRotation;",

	"varying vec2 vTextureCoord;",

	"void main() {",
	"	vTextureCoord = aTextureCoord / uResolution;",
	"   vec2 csCoord = (aPosition / uResolution) * 2.0 - 1.0;",
	"	gl_Position = vec4(csCoord, 0.0, 1.0);",
	"}"
].join("\n");

// Note: function allows us to hardcode the gamma value for better optimization. 
// Requires recompiling shader every time gamma is changed.
const SHADER_SPRITE_SHADER_FRAG = [
	"precision highp float;",

	"varying vec2 vTextureCoord;",

	"uniform sampler2D uTexture;",

	"void main() {",
	"	vec4 pixel = texture2D(uTexture, vTextureCoord);",
	//"	pixel = mix(pixel, vec4(0.0, 0.0, 1.0, 1.0), 0.5);",
	"	gl_FragColor = pixel;",
	"}"
].join("\n");


export class SpriteShader extends Shader {

	public name = "sprite shader";

	public get texture(): Texture {
		return this.uniforms["uTexture"].value;
	}
	public set texture(value: Texture) {
		this.uniforms["uTexture"].value = value;
	}

	public get scale(): number {
		return this.uniforms["uScale"].value;
	}
	public set scale(value: number) {
		this.uniforms["uScale"].value = value;
	}

	public get rotation(): number {
		return this.uniforms["uRotation"].value;
	}
	public set rotation(value: number) {
		this.uniforms["uRotation"].value = value;
	}


	public get resolution(): Vec2 {
		return this.uniforms["uResolution"].value;
	}
	public set resolution(value: Vec2) {
		this.uniforms["uResolution"].value = value;
	}

	public constructor(renderer: Renderer, resolution: Vec2) {
		super(renderer, SHADER_SPRITE_SHADER_VERT, SHADER_SPRITE_SHADER_FRAG,
			{
				aPosition: new Attribute(renderer.gl.FLOAT, 2),
				aTextureCoord: new Attribute(renderer.gl.FLOAT, 2)
			},
			{
				uTexture: new Uniform("t", null),
				uResolution: new Uniform("2f", resolution),
				uScale: new Uniform("1f", 1),
				uRotation: new Uniform("1f", 0)
			},
			2
		);
	}
}
