
import { Shader, Attribute, Uniform } from "./Shader"
import { Renderer } from "../Renderer";
import { Batch } from "../Batch";
import { Texture } from "../Texture";
import { Vec2 } from "../../Math/Vec";
import { SHADER_DEFINE_PI } from "./Common";

const SHADER_DRAWPOINT_VERT = [
	"precision highp float;",

	SHADER_DEFINE_PI,

	"attribute vec4 aColor;",
	"attribute vec2 aTextureCoord;",
	"attribute vec2 aPosition;",
	"attribute vec2 aCenter;",
	"attribute float aRotation;",

	"uniform vec2 uResolution;",

	"varying vec4 vColor;",
	"varying vec2 vTextureCoord;",

	"void main() {",
	"	vColor = vec4(aColor.rgb * aColor.a, aColor.a);",
	"	vTextureCoord = aTextureCoord;",

	"	float rotation = aRotation;",
	"	float c = cos(rotation);",
	"	float s = sin(rotation);",
	"	vec2 rotatedPos = vec2(aPosition.x * c + aPosition.y * s, aPosition.x * -s + aPosition.y * c);",

	"	vec2 pos = aCenter + rotatedPos;",
	"	pos /= uResolution;",
	"	pos.x = pos.x * 2.0 - 1.0;",
	"	pos.y = pos.y * -2.0 + 1.0;",

	"	gl_Position = vec4(pos, 0.0, 1.0);",
	"}",
].join("\n");


const SHADER_DRAWPOINT_FRAG = [
	"precision highp float;",

	"varying vec4 vColor;",
	"varying vec2 vTextureCoord;",

	"uniform sampler2D uBrushTexture;",

	"void main() {",
	"	float a = texture2D(uBrushTexture, vTextureCoord).a;",
	"	gl_FragColor = vec4(vColor * a);",
	"}",
].join("\n");



export class DrawPointShader extends Shader {

	public name = "drawpoint shader";
	public batch: Batch;

	public set brushTexture(texture: Texture) {
		this.uniforms["uBrushTexture"].value = texture;
	}
	public get brushTexture() {
		return this.uniforms["uBrushTexture"].value;
	}
	
	public get resolution(): Vec2 {
		return this.uniforms["uResolution"].value;
	}
	public set resolution(value: Vec2) {
		this.uniforms["uResolution"].value = value;
	}
	

	constructor(renderer: Renderer, resolution: Vec2, maxElements: number) {
		super(renderer, SHADER_DRAWPOINT_VERT, SHADER_DRAWPOINT_FRAG,
			{
				aColor: new Attribute(renderer.gl.FLOAT, 4),
				aTextureCoord: new Attribute(renderer.gl.FLOAT, 2),
				aPosition: new Attribute(renderer.gl.FLOAT, 2),
				aCenter: new Attribute(renderer.gl.FLOAT, 2),
				aRotation: new Attribute(renderer.gl.FLOAT, 1),
			},
			{
				uBrushTexture: new Uniform("t", null),
				uResolution: new Uniform("2f", resolution)
			},
			maxElements
		);
	}
}
