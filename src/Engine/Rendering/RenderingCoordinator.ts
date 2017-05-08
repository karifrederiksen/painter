
/*
	This object ensures that rendering only has 1 animation frame request active at once.
*/
export class RenderingCoordinator {
	protected _renderCallback: () => void;
	protected _requestId = -1;
	protected _perfTracker = new RenderingPerformance(1000);
	
	constructor(renderCallback: () => void) {
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
		this._perfTracker.start();
		this._renderCallback();
		this._perfTracker.stop();
		this._requestId = -1;
	}
}





class RenderingPerformance {
	protected times: number[];
	protected startTime = -1;
	protected nextIdx = -1;
	
	constructor(samples: number) {
		const times = new Array<number>(samples);
		this.times = times;

		// populate
		for (let i = 0; i < samples; i++) {
			times[i] = 1;
		}
	}

	public start() {
		this.startTime = performance.now();
	}

	public stop() {
		const stopTime = performance.now();
		if (this.startTime === -1) {
			console.warn("No start time set.");
			return;
		}
		
		const delta = stopTime - this.startTime;
		this.startTime = -1;

		const idx = (++this.nextIdx) % this.times.length;
		this.times[idx] = delta;

		if (idx === 0) {
			console.info([
				`Rendering times - ${this.times.length} samples`,
				`\tAvg:\t${this.getAverage()} ms`,
				`\tMax:\t${this.getMaxTime()} ms`,
				`\tMin:\t${this.getMinTime()} ms`
			].join("\n"));
		}
	}

	public getAverage() {
		const total = this.times.reduce((prev, curr) => prev + curr, 0);
		return total / this.times.length;
	}

	public getMaxTime() {
		return this.times.reduce((prev, curr) => Math.max(prev, curr));
	}

	public getMinTime() {
		return this.times.reduce((prev, curr) => Math.min(prev, curr));
	}
}