
import { Texture } from "./Texture";
import { Renderer } from "./Renderer";
import { Batch } from "./Batch";

function setSquareBatchArray(batch: Batch) {
	const { array } = batch;

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
}


/*
	Base class for texture generation.
*/
export function generateBrushTexture(renderer: Renderer, texture: Texture) {
	const { gl } = renderer;
	const { brushShader } = renderer.shaders;
	const { batch } = brushShader;

	setSquareBatchArray(batch);

	renderer.setViewportForTexture(texture);
	renderer.clearTexture(texture);
	renderer.flushShaderToTexture(brushShader, texture);
}


export function generateBackgroundTexture(renderer: Renderer, texture: Texture) {
	const { gl } = renderer;
	const { backgroundShader } = renderer.shaders;
	const { batch } = backgroundShader;

	setSquareBatchArray(batch);

	renderer.setViewportForTexture(texture);
	renderer.clearTexture(texture);
	renderer.flushShaderToTexture(backgroundShader, texture);

}