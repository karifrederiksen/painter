
import { Batch } from "./Batch";
import { Vec2, Vec4 } from "../Math/Vec";
import { Rgba, ColorWithAlpha } from "../Math/Color";
import { Equals } from "../Common";

export interface DrawPointArgs {
	position?: Vec2;
	size?: number;
	scale?: number;
	rotation?: number;
	color?: ColorWithAlpha;
}

export class DrawPoint implements Equals<DrawPoint> {
	public constructor(
		public position: Vec2,
		// size in pixels
		public size: number ,
		public scale = 1.0,
		public rotation = 0.0,
		public color: ColorWithAlpha
	){
		Object.freeze(this);
	}

	public set(args: DrawPointArgs) {
		return new DrawPoint(
			args.position	!= null ? args.position	: this.position,
			args.size		!= null ? args.size		: this.size,
			args.scale		!= null ? args.scale	: this.scale,
			args.rotation	!= null ? args.rotation : this.rotation,
			args.color		!= null ? args.color	: this.color,
		);
	}

	public equals(rhs: DrawPoint) {
		return this.position === rhs.position
			&& this.size     === rhs.size
			&& this.scale    === rhs.scale
			&& this.rotation === rhs.rotation
			&& this.color	 === rhs.color;
	}

	public notEqual(rhs: DrawPoint) {
		return this.equals(rhs) === false;
	}
}


export function addDrawPointToBatch(drawPoints: Array<DrawPoint>, batch: Batch): void {
	console.assert(batch != null, `Batch is ${batch}}`);
	const { array } = batch;
	let offset = batch.arrayOffset;

	for (let i = 0, ilen = drawPoints.length; i < ilen; i++) {
		const drawPoint = drawPoints[i];
		const { size, scale, color, position, rotation } = drawPoint;
		const rgba = color.toRgba();
		const { r, g, b, a } = rgba;
		const { x, y } = position;

		// size
		const scaledSize = size * scale;

		// corners locations
		const p0 = -scaledSize / 2;
		const p1 = p0 + scaledSize;

		
		// corner 1
		array[offset++] = r;
		array[offset++] = g;
		array[offset++] = b;
		array[offset++] = a;
		array[offset++] = 0;
		array[offset++] = 0;
		array[offset++] = p0;
		array[offset++] = p0;
		array[offset++] = x;
		array[offset++] = y;
		array[offset++] = rotation;

		// corner 2
		array[offset++] = r;
		array[offset++] = g;
		array[offset++] = b;
		array[offset++] = a;
		array[offset++] = 0;
		array[offset++] = 1;
		array[offset++] = p0;
		array[offset++] = p1;
		array[offset++] = x;
		array[offset++] = y;
		array[offset++] = rotation;

		// corner 3
		array[offset++] = r;
		array[offset++] = g;
		array[offset++] = b;
		array[offset++] = a;
		array[offset++] = 1;
		array[offset++] = 0;
		array[offset++] = p1;
		array[offset++] = p0;
		array[offset++] = x;
		array[offset++] = y;
		array[offset++] = rotation;

		// corner 2
		array[offset++] = r;
		array[offset++] = g;
		array[offset++] = b;
		array[offset++] = a;
		array[offset++] = 0;
		array[offset++] = 1;
		array[offset++] = p0;
		array[offset++] = p1;
		array[offset++] = x;
		array[offset++] = y;
		array[offset++] = rotation;

		// corner 3
		array[offset++] = r;
		array[offset++] = g;
		array[offset++] = b;
		array[offset++] = a;
		array[offset++] = 1;
		array[offset++] = 0;
		array[offset++] = p1;
		array[offset++] = p0;
		array[offset++] = x;
		array[offset++] = y;
		array[offset++] = rotation;

		// corner 4
		array[offset++] = r;
		array[offset++] = g;
		array[offset++] = b;
		array[offset++] = a;
		array[offset++] = 1;
		array[offset++] = 1;
		array[offset++] = p1;
		array[offset++] = p1;
		array[offset++] = x;
		array[offset++] = y;
		array[offset++] = rotation;
	}
	batch.arrayOffset = offset;
}