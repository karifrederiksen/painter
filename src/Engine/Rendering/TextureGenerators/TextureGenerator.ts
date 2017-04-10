
import { Shader } from "../Shaders/Shader";
import { Texture } from "../Texture";
import { Renderer } from "../Renderer";

/*
	Base class for texture generation.
*/
export class TextureGenerator {
	protected readonly _renderer: Renderer;
	public _shader: Shader;

	constructor(renderer: Renderer, standardBrushShader: Shader) {
		this._renderer = renderer;
		this._shader = standardBrushShader;
	}

	public generate(texture: Texture) {
		const renderer = this._renderer;
		const gl = renderer.gl;
		const shader = this._shader;
		const batch = shader.batch;
		const array = batch.array;

		array[0] = -1;
		array[1] = -1;
		
		array[2] = -1;
		array[3] = 1;
		
		array[4] = 1;
		array[5] = -1;
		
		array[6] = -1;
		array[7] = 1;
		
		array[8] = 1;
		array[9] = -1;
		
		array[10] = 1;
		array[11] = 1;
		batch.arrayOffset = 12;

		renderer.setViewport(0, 0, texture.size.x, texture.size.y);
		renderer.clear(texture);
		renderer.flushShaderToTexture(shader, texture);
	}
}
