export function orDefault<a>(value: a | undefined, def: a): a {
	return value !== undefined ? value : def;
}

export function range(start: number, end: number): readonly number[] {
	const length = end - start + 1;
	const arr = new Array<number>(length);
	for (let i = 0; i < length; i++) {
		arr[i] = start + i;
	}
	return arr;
}

export function distance(
	x0: number,
	y0: number,
	x1: number,
	y1: number,
): number {
	const x = x1 - x0;
	const y = y1 - y0;
	return Math.sqrt(x * x + y * y);
}

export function lerp<A extends number>(pct: number, start: A, end: A): A {
	return (start + (end - start) * pct) as A;
}

export function smoothstep<A extends number>(x: A): A {
	return (x * x * (3 - x + x)) as A;
}

export function clamp<A extends number>(value: A, min: A, max: A): A {
	return value < min ? min : value > max ? max : value;
}

export function wrap<A extends number>(value: A, min: A, max: A): A {
	const range = max - min;
	return (value - range * Math.floor((value - min) / range)) as A;
}

export function delay(ms: number): Promise<void> {
	return new Promise((res) => {
		setTimeout(res, ms);
	});
}

export function stringToInt(text: string): number | null {
	const x = parseInt(text, 10);
	if (isNaN(x)) {
		return null;
	}
	return x;
}

export function stringToFloat(text: string): number | null {
	const x = parseFloat(text);
	if (isNaN(x)) {
		return null;
	}
	return x;
}

export function arrUpdate<a>(
	array: readonly a[],
	index: number,
	value: a,
): readonly a[] {
	const newArr = array.slice();
	newArr.splice(index, 1, value);
	return newArr;
}

export function arrInsert<a>(
	array: readonly a[],
	index: number,
	value: a,
): readonly a[] {
	const newArr = array.slice();
	newArr.splice(index, 0, value);
	return newArr;
}

export function arrRemove<a>(array: readonly a[], index: number): readonly a[] {
	const newArr = array.slice();
	newArr.splice(index, 1);
	return newArr;
}
