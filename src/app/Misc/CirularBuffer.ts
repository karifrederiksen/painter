module TSPainter {

	/*
		Base class for circular buffers.

		Expected buffer types:
		Array
		TypedArray
	*/
	export abstract class ICBuffer {
		public headIdx = 0;
		public buffer: any;


		constructor(size: number) {
			this._initBuffer(size);
		}


		// determine the next head position
		public get nextIdx() { return (this.headIdx + 1) % this.buffer.length; }
		public get length() { return this.buffer.length; }


		// add an item to the front
		public add(item: any) {
			this.buffer[this.headIdx = this.nextIdx] = item;
		}


		// move the head forward
		public next() { this.headIdx = this.nextIdx; }


		// initialize the buffer as Array or TypedArray
		protected abstract _initBuffer(size: number);
	}


	/*
		General purpose circular buffer
	*/
	export class CBuffer<T> extends ICBuffer {
		public buffer: Array<T>;

		constructor(size: number) {
			super(size);
		}

		protected _initBuffer(size: number) {
			const buf = new Array(size);
			for (let i = 0; i < size; i++) {
				buf[i] = null;
			}
			this.buffer = buf;
		}
	}


	/*
		Circular buffer for 32-bit floats
	*/
	export class CFloatBuffer extends ICBuffer {
		public buffer: Float32Array;

		constructor(size: number) {
			super(size);
		}

		protected _initBuffer(size: number) {
			this.buffer = new Float32Array(size);
		}
	}
}