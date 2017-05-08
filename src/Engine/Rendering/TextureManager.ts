import { Texture } from "./Texture";
import { Renderer } from "./Renderer";


class BoundTexture {
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
}

function isLessThan(lhs: BoundTexture, rhs: BoundTexture) {
	if (lhs.priority !== rhs.priority) {
		return lhs.priority < rhs.priority
	}
	return lhs.time < rhs.time;
}

/*
	Manages WebGl's texture bindings in order to minimize the amount of time spent rebinding textures
*/
export class TextureManager {
	protected readonly TEXTURE_SLOTS = 32;

	protected readonly _renderer: Renderer;
	protected _boundTextures: BoundTexture[];
	protected _activeTextures = 0;

	constructor(renderer: Renderer) {
		console.assert(renderer != null);
		const textures = new Array<BoundTexture>(this.TEXTURE_SLOTS);
		for (let i = 0, ilen = this.TEXTURE_SLOTS; i < ilen; i++) {
			textures[i] = new BoundTexture(null, i, 0, 0);
		}
		this._boundTextures = textures;
		this._renderer = renderer;
	}


	public bindTexture(texture: Texture, priority: number) {
		console.assert(texture != null);
		console.assert(priority >= 0);
		let idx = this.getIndexOf(texture);
		let { _boundTextures }  = this;

		// return if already bound
		if (idx !== -1) {
			return _boundTextures[idx].textureIndex;
		}


		// store texture
		let bTex: BoundTexture;
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
		const { gl } = this._renderer;
		gl.activeTexture(gl.TEXTURE0 + bTex.textureIndex);
		gl.bindTexture(gl.TEXTURE_2D, this._boundTextures[idx].texture.textureWGL);

		// set priority attributes
		bTex.priority = priority;
		bTex.time = Date.now();

		return bTex.textureIndex;
	}

	public unbindTexture(texture: Texture) {
		console.assert(texture != null);
		let idx = this.getIndexOf(texture);
		if (idx >= 0) {
			const bound = this._boundTextures[idx];
			bound.texture = null;
		} 
	}


	protected getNextBoundTexture() {
		return this._boundTextures[this._activeTextures++];
	}


	// uses sequential search
	// TODO: list should be sorted, so use binary search
	protected getLowestPriorityBoundTexture() {
		const bTexs = this._boundTextures;
		let lowest = bTexs[0];

		for (let i = 1, ilen = bTexs.length; i < ilen; i++) {
			if (isLessThan(lowest, bTexs[i])) {
				lowest = bTexs[i];
			}
		}
		return lowest;
	}


	protected getIndexOf(texture: Texture) {
		console.assert(texture != null);
		return this._boundTextures.findIndex((bTex, idx) => bTex.texture === texture);
	}
}