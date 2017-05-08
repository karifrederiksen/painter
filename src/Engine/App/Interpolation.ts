
import { DrawPoint } from "../Rendering/DrawPoints";
import { Rgb, Rgba } from "../Math/Color";
import { distance } from "../Math/Utils";
import { IArithmetic, Vec2 } from "../Math/Vec";
import { linearInterpolateFunc, InterpFunc } from "../Math/Types";
import { List } from "immutable";


export class InterpolatorResult {
	constructor(
		public readonly values: List<DrawPoint>,
		public readonly next: (prev: InterpolateFunc) => InterpolateFunc
	) {
		Object.freeze(this);
	}
	public get hasValues() { return this.values.count() > 0; }
}

export type InterpolateFunc = (end: DrawPoint) => InterpolatorResult;
export type InterpolatorGenerator = (start: DrawPoint) => InterpolateFunc;

export function interpolatorGenerator(spacingThresholdPx: number): InterpolatorGenerator {
	
	function _createInterpolator(start: DrawPoint): InterpolateFunc {
		return (end: DrawPoint) => {
			const results = doInterpolation(spacingThresholdPx, start, end);
			return (results.count() > 0)
				? new InterpolatorResult(results, (prev: InterpolateFunc) => _createInterpolator(results.last()))
				: new InterpolatorResult(results, (prev: InterpolateFunc) => prev);
		}
	}

	return (start: DrawPoint) => _createInterpolator(start);
}


function getPercentagesToAdd(spacing: number, start: DrawPoint, end: DrawPoint) {
	console.assert(start != null, `Start is ${start}`);
	console.assert(end != null, `End is ${end}`);

	const { 
		position: { x: endX, y: endY },
		scale: endScale
	} = end;

	let {
		position: { x, y },
		scale
	} = start;

	const arr = new Array<number>();
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

	return List(results);
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
	if (delta === delta.default()) {
		return () => start;
	}
	return linearInterpolateFunc(start, end);
}