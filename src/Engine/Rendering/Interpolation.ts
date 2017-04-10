
import { DrawPoint } from "./DrawPoints";
import { Rgb, Rgba } from "../Math/Color";
import { IArithmetic, Vec2 } from "../Math/Vec";


export type Interpolator = (end: DrawPoint) => DrawPoint[];
export type InterpolatorGenerator = (start: DrawPoint) => Interpolator;

export function interpolatorGenerator(spacingThresholdPx: number): InterpolatorGenerator {
	return (start: DrawPoint) => {
		return (end: DrawPoint) => {
			console.assert(end != null, `End is ${end}`);
			const results = interpolationFunction2(spacingThresholdPx, start, end);
			Object.freeze(results);
			return results;
		}
	}
}


function getPercentagesToAdd(spacing: number, start: DrawPoint, end: DrawPoint) {
	const arr = new Array<number>();

	const endSpacing = Math.max(spacing * end.scale);
	const endX = end.position.x;
	const endY = end.position.y;
	const totalDist = Vec2.distance(start.position, end.position);

	let dist = totalDist;
	let p = .1;
	let x = start.position.x;
	let y = start.position.y;
	let scale = start.scale;
	let previous = start;

	// Linear interpolation with a twist
	// The twist being that 'p', the percentage to increment each iteration
	// changes based on the DrawPoint scale for a smoother transition.
	while (dist > endSpacing && p > 0) {
		p = (spacing * start.scale) / dist;

		x += p * (endX - x);
		y += p * (endY - y);
		scale += p * (end.scale - scale);

		start = new DrawPoint(
			Vec2.create(x, y),
			start.size,
			scale,
			undefined,
			undefined
		);

		// add
		if (previous != null && start.notEqual(previous)) {
			arr.push(dist / totalDist);
			previous = start;
		}
		dist = Vec2.distance(start.position, end.position);
	}
	return arr.reverse();
}


function interpolationFunction2(spacing: number, start: DrawPoint, end: DrawPoint) {
	const percentages = getPercentagesToAdd(
		spacing, 
		start, 
		end);
	const funcs = getFunctions(start, end);

	return percentages.map(p => 
		new DrawPoint(
			funcs.position(p),
			end.size,
			funcs.scale(p),
			funcs.rotation(p),
			funcs.color(p)
	));
}


type InterpFunc<T> = (p: number) => T;

interface DrawPointInterpFuncs {
	position: InterpFunc<Vec2>;
	scale: InterpFunc<number>;
	rotation: InterpFunc<number>;
	color: InterpFunc<Rgba>;
}


function getFunctions(start: DrawPoint, end: DrawPoint): DrawPointInterpFuncs {
	return {
		position: arithmeticInterpFunc(
			start.position,
			end.position
		),
		scale: numberInterpFunc(
			start.scale,
			end.scale
		),
		rotation: numberInterpFunc(
			start.rotation,
			end.rotation
		),
		color: arithmeticInterpFunc(
			start.color.toRgba(),
			end.color.toRgba()
		)
	};
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
		return (p: number) => start;
	}
	return (p: number) => start.add(delta.multiplyScalar(p));
}