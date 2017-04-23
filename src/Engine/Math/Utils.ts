
export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

// modulus with expected behaviour
export const mod = (n: number, m: number) => ((n % m) + m) % m;

// expects x to be in range [0, 1]
export const smoothstep = (x: number) => x * x * (3 - 2 * x);

// expects x to be in range [0, 1]
export const smootherstep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

// exponentially scale from 0 to 1
export const expostep = (x: number) => {
	if (x === 0.0) {
		return 0.0;
	}
	return 2.718281828459 ** (1 - (1 / (x * x)));
}

export const isPowerOfTwo = (width: number, height: number) =>
	(width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);

export const distance = (x0: number, y0: number, x1: number, y1: number) =>  Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)