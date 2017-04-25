
import { Events } from "../Engine/Global/Events";
import { Settings } from "../Engine/Global/Settings";

import { clamp } from "../Engine/Math/Utils";


export class HueSlider {
    protected element: HTMLDivElement;
    protected sliderElement: HTMLDivElement;
    protected canvas: HTMLCanvasElement;
    protected isPointerDown = false;

    constructor(elementId: string, sliderId: string) {
        console.assert(elementId != null);
        console.assert(elementId !== "");
        console.assert(sliderId != null);
        console.assert(sliderId !== "");
        this.element = <HTMLDivElement>document.getElementById(elementId);
        this.sliderElement = <HTMLDivElement>document.getElementById(sliderId);
        this.element.addEventListener("pointerdown", this.pointerdown);
        window.addEventListener("pointerup", this.pointerup);
        document.body.addEventListener("pointermove", this.pointermove);
    }

    private pointerup = () => {
        this.isPointerDown = false;
    }


    private pointerdown = (ev: PointerEvent) => {
        this.isPointerDown = true;
        this.pointermove(ev);
    }

    private pointermove = (ev: PointerEvent) => {
        if (this.isPointerDown === false) {
            return;
        }

        const bounds = this.element.getBoundingClientRect();
        const x = ev.x - bounds.left;

        let xpct = x / this.element.clientWidth;
        xpct = clamp(xpct, 0, 1);

        const oldColor = Settings.brush.color.value;
        Events.brush.color.broadcast(oldColor.withH(xpct));
    }


    public setHue(hue: number) {
        const width = this.element.clientWidth;
        const x = Math.round(hue * width) - 1;
        this.sliderElement.style.left = `${x}px`;
    }
}