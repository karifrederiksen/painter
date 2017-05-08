
import { Rgb } from "../Engine/Math/Color";


export class ColorDisplay {
    public primaryElem: HTMLDivElement;
    public secondaryElem: HTMLDivElement;


    constructor(onSwap: () => void) {
        this.primaryElem = <HTMLDivElement>document.getElementById("colorDisplayPrimary");
        this.secondaryElem = <HTMLDivElement>document.getElementById("colorDisplaySecondary");
        this.secondaryElem.addEventListener("pointerdown", () => onSwap());
    }

    public updateColor(rgb: Rgb) {
        console.assert(rgb != null);
        this.primaryElem.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    public swapColors() {
        const tmp = this.primaryElem.style.backgroundColor;
        this.primaryElem.style.backgroundColor = this.secondaryElem.style.backgroundColor;
        this.secondaryElem.style.backgroundColor = tmp;
    }
}