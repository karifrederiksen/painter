module TSPainter {
	export class BoundTexture {
		constructor(
			// the bound texture
			public texture: Texture,

			// the index that the texture is bound to
			public textureIndex: number,

			// textures with higher priority will be deallocated last
			public priority: number,

			// time that the texture was bound (in millis)
			public time: number
		) { }


		public isLessThan(rhs: BoundTexture) {
			if (this.priority !== rhs.priority) {
				return this.priority < rhs.priority
			}
			return this.time < rhs.time;
		}
	}


	/*
		Manages WebGl's texture bindings in order to minimize the amount of time spent rebinding textures
	*/
	export class TextureManager {
		protected readonly TEXTURE_SLOTS = 32;

		protected _renderer: Renderer;
		protected _boundTextures: Array<BoundTexture>;
		protected _activeTextures = 0;

		constructor(renderer: Renderer) {
			const textures = new Array<BoundTexture>(this.TEXTURE_SLOTS);
			for (let i = 0, ilen = this.TEXTURE_SLOTS; i < ilen; i++) {
				textures[i] = new BoundTexture(null, i, 0, 0);
			}
			this._boundTextures = textures;
			this._renderer = renderer;
		}


		public bindTexture(texture: Texture, priority: number) {
			let idx = this.getIndexOf(texture);
			let bTex: BoundTexture;

			// return if already bound
			if (idx !== -1) {
				bTex = this._boundTextures[idx];
			}
			else {
				// store texture
				if (this._activeTextures < this.TEXTURE_SLOTS) {
					bTex = this.getNextBoundTexture();
				}
				else {
					bTex = this.getLowestPriorityBoundTexture();
				}

				// set texture
				bTex.texture = texture;
				idx = this.getIndexOf(texture);

				// bind
				const gl = this._renderer.gl;
				gl.activeTexture(gl.TEXTURE0 + bTex.textureIndex);
				gl.bindTexture(gl.TEXTURE_2D, this._boundTextures[idx].texture.textureWGL);
			}

			// set priority attributes
			bTex.priority = priority;
			bTex.time = Date.now();

			return bTex.textureIndex;
		}


		protected getNextBoundTexture() {
			return this._boundTextures[this._activeTextures++];
		}


		// uses sequential search
		// TODO: list should be sorted, so use binary search
		protected getLowestPriorityBoundTexture() {
			const bTextures = this._boundTextures;
			let lowest = bTextures[0];
			for (let i = 1, ilen = bTextures.length; i < ilen; i++) {
				if (lowest.isLessThan(bTextures[i])) {
					lowest = bTextures[i];
				}
			}
			return lowest;
		}


		protected getIndexOf(texture: Texture) {
			const bTextures = this._boundTextures;
			for (let i = 0, ilen = bTextures.length; i < ilen; i++) {
				if (bTextures[i].texture === texture) {
					return i;
				}
			}
			return -1;
		}
	}
}