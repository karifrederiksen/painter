
import { Sprite } from "../Sprite";
import { Texture } from "../Texture";
import { GUID } from "../../Common";

export interface LayerBasic {
	name: string;
	scale: number;
	rotation: number;
	visible: boolean;
}

// the whole reason why we use LayerBasic is to hide the sprite field.
// we could alternatively associate sprite with the layer through a Map<Layer, Sprite> 
// - this would remove the need for casting and be more safe (current you can just cast it back to Layer)
export class Layer implements LayerBasic {
	public readonly id = GUID.next();
	public readonly sprite: Sprite;

	public readonly name: string;
	public get scale() { return this.sprite.scale; }
	public get rotation() { return this.sprite.rotation; }
	public readonly visible: boolean;

	private constructor(sprite: Sprite, name: string, visible: boolean) {
        console.assert(sprite != null);
		this.sprite = sprite;
		this.name = name || `Layer  ${this.id}`;
		Object.freeze(this);
	}

	public static create(sprite: Sprite, name: string, visible: boolean) {
		return new Layer(sprite, name, visible);
	}

	public asInvisible() {
		return this.visible 
			? Layer.create(this.sprite, this.name, false)
			: this;
	}

	public asVisible() {
		return this.visible === false
			? Layer.create(this.sprite, this.name, true)
			: this;
	}

	public withName(name: string) {
		return Layer.create(this.sprite, name, this.visible);
	}

	public withSprite(sprite: Sprite) {
		return Layer.create(sprite, this.name, this.visible);
	}
}