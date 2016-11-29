module TSPainter {
	export class Vec3 {
		public constructor(
			public x = 0.0,
			public y = 0.0,
			public z = 0.0
		) { }

        // color
        public get h() { return this.x; }
        public get s() { return this.y; }
        public get v() { return this.z; }

        public get r() { return this.x; }
        public get g() { return this.y; }
        public get b() { return this.z; }

        public set h(n: number) { this.x = n; }
        public set s(n: number) { this.y = n; }
        public set v(n: number) { this.z = n; }

        public set r(n: number) { this.x = n; }
        public set g(n: number) { this.y = n; }
        public set b(n: number) { this.z = n; }


        public hsv(h: number, s: number, v: number) {
            this.x = h;
            this.y = s;
            this.z = v;
        }

        public rgb(r: number, g: number, b: number) {
            this.x = r;
            this.y = g;
            this.z = b;
        }

        public xyz(x: number, y: number, z: number) {
            this.x = x;
            this.y = y;
            this.z = z;
        }


        public pow(n: number) {
            this.x = Math.pow(this.x, n);
            this.y = Math.pow(this.y, n);
            this.z = Math.pow(this.z, n);
        }
	}
}