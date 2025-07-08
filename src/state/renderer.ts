import type { v2 } from "~/util";

export interface Renderer {
	readonly canvasSize: v2;
	// TODO: webgpu state and cached derived state
}

export interface WithRenderer {
	readonly renderer: Renderer;
}

export function initRenderer(canvasSize: v2): WithRenderer {
	return {
		renderer: { canvasSize },
	};
}
