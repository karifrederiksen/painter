import { Hsluv } from "color";

export interface WithPalette {
	readonly palette: readonly Hsluv[];
}

export function initPalette(): WithPalette {
	const black = new Hsluv(0, 0, 1);
	const white = new Hsluv(0, 0, 0);
	return {
		palette: [black, white],
	};
}
