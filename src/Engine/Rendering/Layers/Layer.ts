
import { Sprite } from "../Sprite";
import { Texture } from "../Texture";
import { GUID } from "../../Common";


export interface LayerArgs {
	name?: string;
	scale?: number;
	rotation?: number;
	visible?: boolean;
}

export class Layer {
	private static 	LAYER_NUMBER = 1;
	public readonly id: number;

	public readonly name: string;
	public readonly scale: number;
	public readonly rotation: number;
	public readonly visible: boolean;

	private constructor(id: number, name: string, scale: number, rotation: number, visible: boolean) {
        console.assert(id >= 0);
		this.id = id;
		this.name = name || `Layer ${Layer.LAYER_NUMBER++}`;
		this.scale = scale;
		this.rotation = rotation;
		this.visible = visible;
		Object.freeze(this);
	}

	public static create(sprite: number, name: string = null, scale = 1, rotation = 0, visible = true) {
		return new Layer(sprite, name, scale, rotation, visible);
	}

	public static createWithSprite(sprite: Sprite, name: string, visible: boolean) {
		return new Layer(sprite.id, name, sprite.scale, sprite.rotation, visible);
	}

	public set(args: LayerArgs) {
		return new Layer(
			this.id,
			args.name		!= null ? args.name		: this.name,
			args.scale		!= null ? args.scale	: this.scale,
			args.rotation	!= null ? args.rotation	: this.rotation,
			args.visible	!= null ? args.visible	: this.visible
		);
	}
}