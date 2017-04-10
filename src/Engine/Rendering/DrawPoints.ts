
import { Batch, ElementsBatch } from "./Batch";
import { Vec2, Vec4 } from "../Math/Vec";
import { Rgba, ColorWithAlpha } from "../Math/Color";

export class DrawPoint {
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

	public withPosition = (position: Vec2) =>
		new DrawPoint(
			position,
			this.size,
			this.scale,
			this.rotation,
			this.color
		);
	

	public withSize = (size: number) =>
		new DrawPoint(
			this.position,
			size,
			this.scale,
			this.rotation,
			this.color
		);
	

	public withScale = (scale: number) => 
		new DrawPoint(
			this.position,
			this.size,
			scale,
			this.rotation,
			this.color
		);
	

	public withRotation = (rotation: number) =>
		new DrawPoint(
			this.position,
			this.size,
			this.scale,
			rotation,
			this.color
		);

	public withColor = (color: Rgba) =>
		new DrawPoint(
			this.position,
			this.size,
			this.scale,
			this.rotation,
			color
		);

	public equal(rhs: DrawPoint) {
		console.assert(rhs != null, `RHS is ${rhs}`);
		return this.position === rhs.position
			&& this.size     === rhs.size
			&& this.scale    === rhs.scale
			&& this.rotation === rhs.rotation
			&& this.color	 === rhs.color;
	}

	public notEqual(rhs: DrawPoint) {
		console.assert(rhs != null, `RHS is ${rhs}`);
		return this.equal(rhs) === false;
	}
}


export function addDrawPointToBatch(drawPoints: Array<DrawPoint>, batch: Batch): void {
	console.assert(batch != null, `Batch is ${batch}}`);
	const array = batch.array;
	let offset = batch.arrayOffset;
	let color: Rgba;

	let scaledSize = 0;

	let p0 = 0;
	let p1 = 0;

	let drawPoint: DrawPoint = null;
	for (let i = 0, ilen = drawPoints.length; i < ilen; i++) {
		drawPoint = drawPoints[i];

		// size
		scaledSize = drawPoint.size * drawPoint.scale;

		// corners locations
		p0 = -scaledSize / 2;
		p1 = p0 + scaledSize;

		color = drawPoint.color.toRgba();
		
		// corner 1
		array[offset++] = color.r;
		array[offset++] = color.g;
		array[offset++] = color.b;
		array[offset++] = color.a;
		array[offset++] = 0;
		array[offset++] = 0;
		array[offset++] = p0;
		array[offset++] = p0;
		array[offset++] = drawPoint.position.x;
		array[offset++] = drawPoint.position.y;
		array[offset++] = drawPoint.rotation;

		// corner 2
		array[offset++] = color.r;
		array[offset++] = color.g;
		array[offset++] = color.b;
		array[offset++] = color.a;
		array[offset++] = 0;
		array[offset++] = 1;
		array[offset++] = p0;
		array[offset++] = p1;
		array[offset++] = drawPoint.position.x;
		array[offset++] = drawPoint.position.y;
		array[offset++] = drawPoint.rotation;

		// corner 3
		array[offset++] = color.r;
		array[offset++] = color.g;
		array[offset++] = color.b;
		array[offset++] = color.a;
		array[offset++] = 1;
		array[offset++] = 0;
		array[offset++] = p1;
		array[offset++] = p0;
		array[offset++] = drawPoint.position.x;
		array[offset++] = drawPoint.position.y;
		array[offset++] = drawPoint.rotation;

		// corner 2
		array[offset++] = color.r;
		array[offset++] = color.g;
		array[offset++] = color.b;
		array[offset++] = color.a;
		array[offset++] = 0;
		array[offset++] = 1;
		array[offset++] = p0;
		array[offset++] = p1;
		array[offset++] = drawPoint.position.x;
		array[offset++] = drawPoint.position.y;
		array[offset++] = drawPoint.rotation;

		// corner 3
		array[offset++] = color.r;
		array[offset++] = color.g;
		array[offset++] = color.b;
		array[offset++] = color.a;
		array[offset++] = 1;
		array[offset++] = 0;
		array[offset++] = p1;
		array[offset++] = p0;
		array[offset++] = drawPoint.position.x;
		array[offset++] = drawPoint.position.y;
		array[offset++] = drawPoint.rotation;

		// corner 4
		array[offset++] = color.r;
		array[offset++] = color.g;
		array[offset++] = color.b;
		array[offset++] = color.a;
		array[offset++] = 1;
		array[offset++] = 1;
		array[offset++] = p1;
		array[offset++] = p1;
		array[offset++] = drawPoint.position.x;
		array[offset++] = drawPoint.position.y;
		array[offset++] = drawPoint.rotation;
	}
	batch.arrayOffset = offset;
}