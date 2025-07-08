import type { Image } from "./base";

export interface WithMinimap {
	readonly minimap: Image | null;
}

export function initMinimap(): WithMinimap {
	return {
		minimap: null,
	};
}
