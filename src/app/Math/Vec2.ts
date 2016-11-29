/// <reference path="Utils.ts"/>

module TSPainter {
	export class Vec2 {
		constructor(
			public x = 0.0,
			public y = 0.0
		) { }
        

        public xy(x: number, y: number) {
            this.x = x;
			this.y = y;
			return this;
		}


		public plus(n: number) {
			this.x += n;
			this.y += n;
			return this;
		}


		public minus(n: number) {
			this.x -= n;
			this.y -= n;
			return this;
		}


		public multiply(n: number) {
			this.x *= n;
			this.y *= n;
			return this;
		}


		public divide(n: number) {
			this.x /= n;
			this.y /= n;
			return this;
		}


		public modulo(n: number) {
			this.x = mod(this.x, n);
			this.y = mod(this.y, n);
			return this;
		}


		public static distance(from: Vec2, to: Vec2) {
			return Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
		}


		public equals(rhs: Vec2) {
			return this.x === rhs.x && this.y === rhs.y;
		}


		public static dot(lhs: Vec2, rhs: Vec2) {
			return lhs.x * rhs.x + lhs.y * rhs.y;
		}


		public static angle(from: Vec2, to: Vec2) {
			return Math.atan2(to.y - from.y, to.x - from.y);
		}
	}
}