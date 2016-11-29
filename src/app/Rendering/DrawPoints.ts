module TSPainter {

	export class DrawPoint extends Vec2 {
		// size in pixels
		public size = 0;

		// transforms [0.0 : 1.0]
		public scale = 1.0;
		public rotation = 0.0;

		// color [0.0 : 1.0]
		public red = 0.0;
		public green = 0.0;
		public blue = 0.0;
		public alpha = 1.0;

		public setColor(rgba: Vec4) {
			this.red = rgba.r;
			this.green = rgba.g;
			this.blue = rgba.b;
			this.alpha = rgba.a;
		}

		public equals(rhs: DrawPoint) {
			return this.x        === rhs.x
				&& this.y        === rhs.y
				&& this.size    === rhs.size
				&& this.scale    === rhs.scale
				&& this.rotation === rhs.rotation
				&& this.red      === rhs.red
				&& this.green    === rhs.green
				&& this.blue     === rhs.blue
				&& this.alpha    === rhs.alpha;
		}

		public notEqual(rhs: DrawPoint) {
			return this.equals(rhs) === false;
		}

		public copyFrom(rhs: DrawPoint) {
			this.x = rhs.x;
			this.y = rhs.y;
			this.size = rhs.size;
			this.scale = rhs.scale;
			this.rotation = rhs.rotation;
			this.red = rhs.red;
			this.green = rhs.green;
			this.blue = rhs.blue;
			this.alpha = rhs.alpha;
		}
    }



    export class DrawPointQueue {
        protected _nextIndex = 0;
        protected _colorRgba = new Vec4();
		protected _colorHsva = new Vec4();

		public _points: DrawPoint[];

        constructor(initialLength: number) {
            const points = new Array(initialLength);
            
            //populate the whole arrays
            for (let i = 0; i < initialLength; i++) {
                points[i] = new DrawPoint();
            }
            this._points = points;
        }

        public isEmpty() {
            return this._nextIndex === 0;
        }

        public count() {
            return this._nextIndex;
        }

        public purge() {
            this._nextIndex = 0;
        }

		public getFirst() {
			return this._points[0];
		}

		public getLast() {
			return this._points[this._nextIndex - 1];
		}

		public atIndex(index: number) {
			return (index >= 0 && index < this._nextIndex) ? this._points[index] : null;
		}


		public newPoint() {
			if (this._nextIndex + 1 < this._points.length) {
				return this._points[this._nextIndex++];
			}
			return null;
		}


		public addDrawPointClone(drawPoint: DrawPoint) {
			const point = this.newPoint();
			if (point === null) {
				return;
			}

			point.x = drawPoint.x;
			point.y = drawPoint.y;

			point.size = drawPoint.size;

			point.scale = drawPoint.scale;
			point.rotation = drawPoint.rotation;

			point.red = drawPoint.red;
			point.green = drawPoint.green;
			point.blue = drawPoint.blue;
			point.alpha = drawPoint.alpha;
		}


		public addToElementsBatch(batch: ElementsBatch) {
			const array = batch.array;
			const drawPoints = this._points;
			let offset = batch.arrayOffset;

			let scaledSize = 0;

			let p0 = 0, p1 = 0;

			let drawPoint: DrawPoint = null;
			for (let i = 0, ilen = this.count(); i < ilen; i++) {
				drawPoint = drawPoints[i];

				// size
				scaledSize = drawPoint.size * drawPoint.scale;

				// corners locations
				p0 = -scaledSize / 2;
				p1 = p0 + scaledSize;

				// corner 1
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 0;
				array[offset++] = 0;
				array[offset++] = p0;
				array[offset++] = p0;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 2
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 0;
				array[offset++] = 1;
				array[offset++] = p0;
				array[offset++] = p1;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 3
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 1;
				array[offset++] = 1;
				array[offset++] = p1;
				array[offset++] = p1;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 4
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 1;
				array[offset++] = 0;
				array[offset++] = p1;
				array[offset++] = p0;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;
			}
			batch.arrayOffset = offset;
			this.purge();
		}


		public addToBatch(batch: Batch) {
			const array = batch.array;
			const drawPoints = this._points;
			let offset = batch.arrayOffset;

			let scaledSize = 0;

			let p0 = 0, p1 = 0;

			let drawPoint: DrawPoint = null;
			for (let i = 0, ilen = this.count(); i < ilen; i++) {
				drawPoint = drawPoints[i];

				// size
				scaledSize = drawPoint.size * drawPoint.scale;

				// corners locations
				p0 = -scaledSize / 2;
				p1 = p0 + scaledSize;

				// corner 1
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 0;
				array[offset++] = 0;
				array[offset++] = p0;
				array[offset++] = p0;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 2
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 0;
				array[offset++] = 1;
				array[offset++] = p0;
				array[offset++] = p1;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 3
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 1;
				array[offset++] = 0;
				array[offset++] = p1;
				array[offset++] = p0;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 2
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 0;
				array[offset++] = 1;
				array[offset++] = p0;
				array[offset++] = p1;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 3
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 1;
				array[offset++] = 0;
				array[offset++] = p1;
				array[offset++] = p0;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;

				// corner 4
				array[offset++] = drawPoint.red;
				array[offset++] = drawPoint.green;
				array[offset++] = drawPoint.blue;
				array[offset++] = drawPoint.alpha;
				array[offset++] = 1;
				array[offset++] = 1;
				array[offset++] = p1;
				array[offset++] = p1;
				array[offset++] = drawPoint.x;
				array[offset++] = drawPoint.y;
				array[offset++] = drawPoint.rotation;
			}
			batch.arrayOffset = offset;
			this.purge();
		}
    }
}