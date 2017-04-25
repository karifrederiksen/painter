
import { Rgb } from "../Engine/Math/Color";


export class ColorDisplay {
    public primaryElem: HTMLDivElement;
    public secondaryElem: HTMLDivElement;


    constructor(primaryId: string, secondaryId: string) {
        console.assert(primaryId != null);
        console.assert(primaryId !== "");
        console.assert(secondaryId != null);
        console.assert(secondaryId !== "");
        this.primaryElem = <HTMLDivElement>document.getElementById(primaryId);
        this.secondaryElem = <HTMLDivElement>document.getElementById(secondaryId);
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