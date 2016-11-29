module TSPainter {

	// modulus with expected behaviour
	export function mod(n: number, m: number) { return ((n % m) + m) % m; }

	// expects x to be in range [0, 1]
	export function smoothstep(x: number) { return x * x * (3 - 2 * x); }

	// expects x to be in range [0, 1]
	export function smootherstep(x: number) { return x * x * x * (x * (x * 6 - 15) + 10); }

	// exponentially scale from 0 to 1
	export function expostep(x: number) {
		if (x === 0.0)
			return 0.0;
		return 2.718281828459 ** (1 - (1 / (x * x)));
	}

	export function isPowerOfTwo(width: number, height: number) {
		return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
	}
}