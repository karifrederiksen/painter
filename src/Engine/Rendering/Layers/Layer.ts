
import { Sprite } from "../Sprite";
import { Texture } from "../Texture";

export class Layer extends Sprite {
	public texture: Texture;
	public id: number;
	public name: string;


	constructor(texture: Texture, id: number) {
		super(texture);
        console.assert(texture != null);
        console.assert(id >= 0);
		this.texture = texture;
		this.id = id;
		this.name = ["Layer ", id].join("");
	}
}