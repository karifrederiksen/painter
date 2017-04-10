
/*
	This object ensures that rendering only has 1 animation frame request active at once.
*/
export class RenderingCoordinator {
	protected _renderCallback: () => any;
	protected _requestId = -1;
	
	constructor(renderCallback: () => any) {
		console.assert(renderCallback != null, `RenderCallback is ${renderCallback}`);
		this._renderCallback = renderCallback;
	}

	public requestRender() {
		if (this._requestId === -1) {
			this._requestId = requestAnimationFrame(this._render);
		}
	}

	public forceRender() {
		// clear timeout if one exists
		if (this._requestId >= 0) {
			cancelAnimationFrame(this._requestId);
		}
		this._render();
	}


	protected _render = () => {
		this._renderCallback();
		this._requestId = -1;
	}
}
