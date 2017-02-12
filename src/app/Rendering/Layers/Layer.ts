module TSPainter.Rendering {
	export class Layer extends Sprite {
		public texture: Texture;
		public id: number;
		public name: string;


		constructor(texture: Texture, id: number) {
			super(texture);
			this.texture = texture;
			this.id = id;
			this.name = ["Layer ", id].join("");
		}
	}
}