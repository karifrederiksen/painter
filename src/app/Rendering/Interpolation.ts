module TSPainter.Rendering {
	export class Interpolator {
		public drawPoints: DrawPointQueue;
		public tmpPoint = new DrawPoint();
		public previousPoint = new DrawPoint();
		public spacingThresholdPx: number;

		constructor(initialLength: number, spacingPx: number) {
			this.drawPoints = new DrawPointQueue(initialLength);
			this.spacingThresholdPx = spacingPx;
		}


		public setInitialPoint(start: DrawPoint) {
			this.previousPoint.copyFrom(start);
			this.drawPoints.addDrawPointClone(start);
		}


		public interpolate(end: DrawPoint) {
			return this._interpolate(end);
		}


		protected _passThrough(end: DrawPoint) {
			this.drawPoints.addDrawPointClone(end);
		}


		protected _interpolate(end: DrawPoint) {
			const drawPoints = this.drawPoints;
			const spacing = this.spacingThresholdPx;
			const endSpacing = Math.max(spacing * end.scale);
			
			const start = this.previousPoint;
			const previous = this.drawPoints.getLast();


			let p = .1;
			let dist = Vec2.distance(start, end);

			let count = 0;
			while (dist > endSpacing && p > 0) {
				p = (spacing * start.scale) / dist;

				start.x += p * (end.x - start.x);
				start.y += p * (end.y - start.y);
				start.scale += p * (end.scale - start.scale);
				start.rotation += p * (end.rotation - start.rotation);
				start.red += p * (end.red - start.red);
				start.green += p * (end.green - start.green);
				start.blue += p * (end.blue - start.blue);
				start.alpha += p * (end.alpha - start.alpha);


				dist = Vec2.distance(start, end);

				// add
				if (previous == null || previous.notEqual(start)) {
					drawPoints.addDrawPointClone(start);
				}
			}
		}
	}
}