﻿/*
	Pseudo-random number generator
	Meant for testing purposes, so I can get the same pattern every time I test something using random numbers.

	https://en.wikipedia.org/wiki/Xorshift
	Implementation of Xorshift 128
*/

/*export type RNG = IterableIterator<number>;

export function* floatRNG(seed: number) {
	const _rng = intRNG(seed);
	while (true) {
		yield (_rng.next().value >>> 0 ) / ((1 << 30) * 2);
	}
}

export function* intRNG(seed: number) {
	let x = seed;
	let y = 0;
	let z = 0;
	let w = 0;
	while(true) {
		const t = x ^ (x << 11);
		x = y;
		y = z;
		z = w;
		w ^= (w >> 19) ^ t ^ (t >> 8);
		yield w;
	}
}*/
export class RNG {
	public x: number;
	public y: number;
	public z: number;
	public w: number;


	constructor(seed: number = performance.now()) {
		this.seed(seed);
	}


	public seed(n: number) {
		this.x = n;
		this.y = 0;
		this.z = 0;
		this.w = 0;

		// Discard some initial values
		for (let i = 0; i < 16; i++) {
			this.nextInt();
		}
	}


	public nextInt() {
		const t = this.x ^ (this.x << 11);
		this.x = this.y;
		this.y = this.z;
		this.z = this.w;
		this.w ^= (this.w >> 19) ^ t ^ (t >> 8);
		return this.w;
	}


	public next() {
		return (this.nextInt() >>> 0) / ((1 << 30) * 2);
	}
}