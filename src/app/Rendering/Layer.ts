module TSPainter {
    export class Layer {
        public texture: Texture;
        public id: number;
        public name: string;


        constructor(texture: Texture, id: number) {
            this.texture = texture;
            this.id = id;
            this.name = ["Layer ", id].join("");
        }
    }
}