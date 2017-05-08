
import { Events } from "../Engine/Global/Events";
import { Settings } from "../Engine/Global/Settings";

import { Hsva, Hsv, Rgb } from "../Engine/Math/Color";
import { clamp } from "../Engine/Math/Utils";


export class HueSlider {
    protected element: HTMLDivElement;
    protected sliderElement: HTMLDivElement;
    protected canvas: HTMLCanvasElement;
    protected isPointerDown = false;
    protected onColorChange: (hsv: Hsv) => void

    constructor(onColorChange: (hsv: Hsv) => void) {
        this.onColorChange = onColorChange;
        this.element = <HTMLDivElement>document.getElementById("hueArea");
        this.sliderElement = <HTMLDivElement>document.getElementById("hueAreaSlider");

        window.addEventListener("pointerup", () => {
            this.isPointerDown = false;
        });
        this.element.addEventListener("pointerdown", (ev) => this.pointerdown(ev));
        window.addEventListener("pointermove", (ev) => this.pointermove(ev));
    }

    private pointerup = () => {
    }


    private pointerdown(ev: PointerEvent) {
        this.isPointerDown = true;
        this.pointermove(ev);
    }

    private pointermove(ev: PointerEvent) {
        if (this.isPointerDown === false) {
            return;
        }

        const bounds = this.element.getBoundingClientRect();
        const x = ev.x - bounds.left;

        let xpct = x / this.element.clientWidth;
        xpct = clamp(xpct, 0, 1);

        const oldColor = Settings.brush.value.primaryColor;
        this.onColorChange(oldColor.set({ h: xpct }));
    }


    public setHue(hue: number) {
        const width = this.element.clientWidth;
        const x = Math.round(hue * width) - 1;
        this.sliderElement.style.left = `${x}px`;
    }
}