/// <reference path="Shader.ts"/>

module TSPainter {
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

		"uniform sampler2D uTexture;",

        "void main() {",
		"	float a = texture2D(uTexture, vTextureCoord).a;",
        "	gl_FragColor = vec4(vColor * a);",
		"}",
    ].join("\n");


	export class DrawPointShader extends Shader {
        protected _brushTexture: Texture;

        public batch: Batch;

		constructor(renderer: Renderer, texture: Texture, maxElements: number) {
			super(renderer, SHADER_DRAWPOINT_VERT, SHADER_DRAWPOINT_FRAG,
				{
					aColor: new Attribute(renderer.gl.FLOAT, 4),
					aTextureCoord: new Attribute(renderer.gl.FLOAT, 2),
					aPosition: new Attribute(renderer.gl.FLOAT, 2),
					aCenter: new Attribute(renderer.gl.FLOAT, 2),
					aRotation: new Attribute(renderer.gl.FLOAT, 1),
				},
				{
					uTexture: new Uniform("t", texture),
					uResolution: new Uniform("2f", new Vec2())
                },
                maxElements,
                false
			);
			this._brushTexture = texture;
			this.setResolution(renderer.canvas.width, renderer.canvas.height);
        }


		public setBrushTexture(texture: Texture) {
			this.uniforms["uTexture"].value = texture;
			this._brushTexture = texture;
		}
		public getBrushTexture = () => this._brushTexture;


		public setResolution(width: number, height: number) {
			const resolution = this.uniforms["uResolution"].value;
			resolution.x = width;
			resolution.y = height;
		}
	}
}