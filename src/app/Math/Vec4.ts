module TSPainter {
	export class Vec4 {
		public constructor(
			public x = 0.0,
			public y = 0.0,
			public z = 0.0,
			public w = 0.0
		) { }


		public get width() { return this.z; }
		public get height() { return this.w; }

		public set width(w: number) { this.z = w; }
		public set height(h: number) { this.w = h; }

		// color
		public get h() { return this.x; }
		public get s() { return this.y; }
		public get v() { return this.z; }
		public get a() { return this.w; }

		public get r() { return this.x; }
		public get g() { return this.y; }
		public get b() { return this.z; }

		public set h(n: number) { this.x = n; }
		public set s(n: number) { this.y = n; }
		public set v(n: number) { this.z = n; }
		public set a(n: number) { this.w = n; }

		public set r(n: number) { this.x = n; }
		public set g(n: number) { this.y = n; }
		public set b(n: number) { this.z = n; }


		public hsv(h: number, s: number, v: number) {
			this.x = h;
			this.y = s;
			this.z = v;
		}


		public hsva(h: number, s: number, v: number, a: number) {
			this.x = h;
			this.y = s;
			this.z = v;
			this.w = a;
		}

		public rgb(r: number, g: number, b: number) {
			this.x = r;
			this.y = g;
			this.z = b;
		}

		public rgba(r: number, g: number, b: number, a: number) {
			this.x = r;
			this.y = g;
			this.z = b;
			this.w = a;
		}

		public xyzw(x: number, y: number, z: number, w: number) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}


		public pow(n: number) {
			this.x = Math.pow(this.x, n);
			this.y = Math.pow(this.y, n);
			this.z = Math.pow(this.z, n);
			this.w = Math.pow(this.w, n);
		}
	}
}