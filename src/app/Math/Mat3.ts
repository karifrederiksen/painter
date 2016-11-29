module TSPainter {
	export class Mat3 {
		public a00: number;
		public a01: number;
		public a02: number;

		public a10: number;
		public a11: number;
		public a12: number;


		constructor() {
			this.toIdentity();
		}



		public toIdentity(): this {
			this.a00 = 1;
			this.a01 = 0;
			this.a02 = 0;

			this.a10 = 0;
			this.a11 = 1;
			this.a12 = 0;

			return this;
		}



		public setTransforms(x: number, y: number, rotation: number, scale: number): this {

			// rotation
			const cos = Math.cos(rotation);
			const sin = Math.sin(rotation);
			let a00 = cos;
			const a01 = sin;
			const a10 = -sin;
			let a11 = cos;

			// scale
			a00 *= scale;
			a11 *= scale;
			
			// translation
			const a02 = x;
			const a12 = y;


			// set transforms
			this.a00 = a00;
			this.a01 = a01;
			this.a02 = a02;

			this.a10 = a10;
			this.a11 = a11;
			this.a12 = a12;

			return this;
		}
	}

}