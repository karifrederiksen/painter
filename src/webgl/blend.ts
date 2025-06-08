export const enum Mode {
	Normal = 1,
	Erase = 2,
}

export interface Factors {
	readonly sfact: number;
	readonly dfact: number;
}

export const factorsNormal: Factors = {
	sfact: WebGL2RenderingContext.ONE,
	dfact: WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
};

export const factorsErase: Factors = {
	sfact: WebGL2RenderingContext.ZERO,
	dfact: WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA,
};

export function getFactors(mode: Mode): Factors {
	switch (mode) {
		case Mode.Normal:
			return factorsNormal;
		case Mode.Erase:
			return factorsErase;
	}
}
