import { Settings } from "../Engine/Global/Settings";

import { Vec2 } from "../Engine/Math/Vec";
import { Hsv, Rgb, colorToGray } from "../Engine/Math/Color";
import { clamp } from "../Engine/Math/Utils";

class ColorAreaPicker {
    protected element: HTMLDivElement;

    constructor(id: string) {
        this.element = <HTMLDivElement>document.getElementById(id);
    }

    public setColor(rgb: Rgb, position: Vec2) {
        console.assert(rgb != null);

        this.element.style.left = `${(position.x-5)}px`;
        this.element.style.top = `${(position.y-5)}px`;
        const gray = colorToGray(rgb);
        const borderColor = gray > .5 ? 0 : 255;
        this.element.style.borderColor = `rgb(${borderColor}, ${borderColor}, ${borderColor})`;
    }
}


export class ColorAreaDoubleBinding {
    protected element: HTMLDivElement;
    protected pickerElement: ColorAreaPicker;
    protected isPointerDown = false;
    protected onColorChange: (hsv: Hsv) => void;

    constructor(onColorChange: (hsv: Hsv) => void) {
        this.onColorChange = onColorChange;
        this.element = <HTMLDivElement>document.getElementById("pickingArea");
        this.pickerElement = new ColorAreaPicker("picker");
        this.element.addEventListener("pointerdown", (ev) => this.pointerdown(ev));
        window.addEventListener("pointerup", () => this.pointerup());
        document.body.addEventListener("pointermove", (ev) => this.pointermove(ev));
    }


    private pointerdown(ev: PointerEvent) {
        this.isPointerDown = true;
        this.pointermove(ev);
    }

    private pointerup() {
        this.isPointerDown = false;
    }


    private pointermove(ev: PointerEvent) {
        if (this.isPointerDown === false) {
            return;
        }

        const bounds = this.element.getBoundingClientRect();
        const x = ev.x - bounds.left;
        const y = ev.y - bounds.top;

        let xpct = x / this.element.clientWidth;
        let ypct = 1 - (y / this.element.clientHeight);
        xpct = clamp(xpct, 0, 1);
        ypct = clamp(ypct, 0, 1);

        const oldColor = Settings.brush.value.primaryColor;
        const newColor = Hsv.create(oldColor.h, xpct, ypct);

        this.onColorChange(newColor);
    } 


    public updateColor(colorHsv: Hsv) {
        console.assert(colorHsv != null);
        const width = this.element.clientWidth;
        const height = this.element.clientHeight;

        const rgb = colorHsv.toRgb();
        const pickerPos = Vec2.create(
            Math.round(colorHsv.s * width),
            Math.round((1 - colorHsv.v) * height)
        );
        this.pickerElement.setColor(rgb, pickerPos);
        
        const bgColor = Hsv.create(colorHsv.h, 1, 1)
            .toRgb()
            .multiplyScalar(255)
            .round();

        const colorStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
        this.element.style.backgroundColor = colorStyle;
    }
}