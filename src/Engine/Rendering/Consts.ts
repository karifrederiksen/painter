
// Define blend modes
export const enum BlendModeType {
	Normal,
	Erase
};

export class BlendModeParams {
	constructor(
		public readonly sfact: number,
		public readonly dfact: number
	){
		Object.freeze(this);
	}
}


// Set up blend modes
export const BLEND_MODE_VALUES: { [n: number]: BlendModeParams } = {};
BLEND_MODE_VALUES[BlendModeType.Normal] = new BlendModeParams(WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
BLEND_MODE_VALUES[BlendModeType.Erase]  = new BlendModeParams(WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);

Object.freeze(BLEND_MODE_VALUES);