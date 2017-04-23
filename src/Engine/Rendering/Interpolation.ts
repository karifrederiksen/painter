
import { DrawPoint } from "./DrawPoints";
import { Rgb, Rgba } from "../Math/Color";
import { distance } from "../Math/Utils";
import { IArithmetic, Vec2 } from "../Math/Vec";
import { linearInterpolateFunc, InterpFunc } from "../Math/IArithmetic";


export class InterpolatorResult {
	constructor(
		public values: DrawPoint[],
		public next: (prev: Interpolator) => Interpolator
	) {
		Object.freeze(this);
	}
	public get hasValues() { return this.values.length > 0; }
}

export type Interpolator = (end: DrawPoint) => InterpolatorResult;
export type InterpolatorGenerator = (start: DrawPoint) => Interpolator;

export function interpolatorGenerator(spacingThresholdPx: number): InterpolatorGenerator {
	
	function _createInterpolator(start: DrawPoint): Interpolator {
		return (end: DrawPoint) => {
			const results = doInterpolation(spacingThresholdPx, start, end);
			return (results.length > 0)
				? new InterpolatorResult(results, (prev: Interpolator) => _createInterpolator(results[results.length - 1] ))
				: new InterpolatorResult(results, (prev: Interpolator) => prev);
		}
	}

	return (start: DrawPoint) => _createInterpolator(start);
}


function getPercentagesToAdd(spacing: number, start: DrawPoint, end: DrawPoint) {
	console.assert(start != null, `Start is ${start}`);
	console.assert(end != null, `End is ${end}`);

	const arr = new Array<number>();

	const endX = end.position.x;
	const endY = end.position.y;
	const endScale = end.scale;

	let x = start.position.x;
	let y = start.position.y;
	let scale = start.scale;

	const endSpacing = Math.max(spacing * endScale);
	const totalDist = distance(x, y, endX, endY);

	let dist = totalDist;
	let p = .1;
	let prevX = x;
	let prevY = y;
	let prevScale = scale;

	// Linear interpolation with a twist
	// The twist being that 'p', the percentage to increment each iteration
	// changes based on the DrawPoint scale for a smoother transition.
	while (dist > endSpacing && p > 0) {
		p = (spacing * scale) / dist;

		// current values
		x += p * (endX - x);
		y += p * (endY - y);
		scale += p * (endScale - scale);

		// add if current values are not equal to previous ones
		if (x !== prevX || y !== prevY || scale !== prevScale) {
			arr.push(dist / totalDist);
			prevX = x;
			prevY = y;
			prevScale = scale;
		}
		dist = distance(x, y, endX, endY);
	}
	return arr.reverse();
}


function doInterpolation(spacing: number, start: DrawPoint, end: DrawPoint) {
	const percentages = getPercentagesToAdd(
		spacing, 
		start, 
		end
	);
	const position = arithmeticInterpFunc(
		start.position,
		end.position
	);
	const color =  arithmeticInterpFunc(
		start.color.toRgba(),
		end.color.toRgba()
	);
	const scale = numberInterpFunc(
		start.scale,
		end.scale
	);
	const rotate = numberInterpFunc(
		start.rotation,
		end.rotation
	);

	const results = percentages.map(p => 
		new DrawPoint(
			position(p),
			end.size,
			scale(p),
			rotate(p),
			color(p)
	));

	Object.freeze(results);
	return results;
}


function numberInterpFunc(start: number, end: number) {
	const delta = end - start;
	if (delta === 0) {
		return () => start;
	}
	return (p: number) => start + delta * p;
}

function arithmeticInterpFunc<T extends IArithmetic<T>>(start: T, end: T) {
	const delta = end.subtract(start);
	if (delta.isDefault()) {
		return () => start;
	}
	return linearInterpolateFunc(start, end);
}