import { Shader, Attribute, Uniform } from "./Shader";
import { Texture } from "../Texture";
import { Renderer } from "../Renderer";
import { Vec2 } from "../../Math/Vec";

/*
	Used for Texture objects
*/
const SHADER_SHADER_VERT = [
	"precision highp float;",

	"attribute vec2 aPosition;",

	"varying vec2 vTextureCoord;",

	"void main() {",
		"vTextureCoord = aPosition;",
		"gl_Position = vec4(aPosition, 0.0, 1.0);",
	"}"
].join("\n");


// Checker pattern
const SHADER_SHADER_FRAG = [
	"precision highp float;",

	"varying vec2 vTextureCoord;",

	"uniform vec2 uResolution;",
	"uniform float uScale;",

	"void main() {",
		"vec2 uv = uScale * vTextureCoord * 32.5;",

		"float x = mod(floor(uv.x), 2.0);",
		"float y = mod(floor(uv.y), 2.0);",

		"bool isDark = bool(mod(x + y, 2.0));",

		"vec3 color = vec3(isDark ? 0.8 : 0.4);",

		"gl_FragColor = vec4(color, 1.0);",
	"}"
].join("\n");


export class BackgroundShader extends Shader {

	public name = "background shader";

	public get scale(): number {
		return this.uniforms["uScale"].value;
	}
	public set scale(value: number) {
		this.uniforms["uScale"].value = value;
	}

	public get resolution(): Vec2 {
		return this.uniforms["uResolution"].value;
	}
	public set resolution(value: Vec2) {
		this.uniforms["uResolution"].value = value;
	}

	public constructor(renderer: Renderer, resolution: Vec2) {
		super(renderer, SHADER_SHADER_VERT, SHADER_SHADER_FRAG,
			{
				aPosition: new Attribute(renderer.gl.FLOAT, 2)
			},
			{
				uResolution: new Uniform("2f", resolution),
				uScale: new Uniform("1f", 1)
			},
			2
		);
	}
}
