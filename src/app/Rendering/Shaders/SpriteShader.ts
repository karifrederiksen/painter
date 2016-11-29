/*
    Used for Texture objects
*/
module TSPainter {

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
        protected _texture: Texture = null;

        public constructor(renderer: Renderer) {
            super(renderer, SHADER_SPRITE_SHADER_VERT, SHADER_SPRITE_SHADER_FRAG,
                {
                    aPosition: new Attribute(renderer.gl.FLOAT, 2),
                    aTextureCoord: new Attribute(renderer.gl.FLOAT, 2)
                },
                {
                    uTexture: new Uniform("t", null),
                    uResolution: new Uniform("2f", new Vec2()),
                    uScale: new Uniform("1f", 1),
                    uRotation: new Uniform("1f", 0)
                },
                2
            );
			this.setResolution(renderer.canvas.width, renderer.canvas.height);
        }


        public render(sprite: Sprite) {
            sprite.addToBatch(this.batch);
            this.setTexture(sprite.texture);
            this.setScale(sprite.scale);
            this.batch.flush();
        }


        protected setTexture(texture: Texture) {
            this.uniforms["uTexture"].value = texture;
            this._texture = texture;
        }
        protected getTexture = (): Texture => this._texture;


		protected setScale(scale: number) {
			this.uniforms["uScale"].value = scale;
		}
		protected getScale = (): number => this.uniforms["uScale"].value;


		protected setRotation(rotation: number) {
			this.uniforms["uRotation"].value = rotation;
		}
		protected getRotation = (): number => this.uniforms["uRotation"].value;


		public setCanvasWidth(width: number) {
			this.uniforms["uResolution"].value.x = width;
		}
		public setCanvasHeight(height: number) {
			this.uniforms["uResolution"].value.y = height;
		}
		public setResolution(width: number, height: number) {
			const resolution = this.uniforms["uResolution"].value
            resolution.x = width;
			resolution.y = height;
        }
    }
}