
import * as Events from "./Engine/Global/Events";
import * as Settings from "./Engine/Global/Settings";

import { Vec2, Vec3 } from "./Engine/Math/Vec";
import { Hsv, Rgb, Color } from "./Engine/Math/Color";
import { clamp } from "./Engine/Math/Utils";

export interface SliderDoubleBindingArgs {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    precision?: number;
}

export class SliderElement {
    protected _text: HTMLSpanElement;
    protected _value: HTMLSpanElement;
    public input: HTMLInputElement;
    public precision: number;


    constructor(sliderId: string, text: string, args?: SliderDoubleBindingArgs) {
        const inputElem  = this.input = <HTMLInputElement>document.getElementById(sliderId);
        const textElem = this._text = <HTMLSpanElement>document.getElementById(sliderId + "Text");
        this._value = <HTMLSpanElement>document.getElementById(sliderId + "Value");
        this.precision = args.precision ? args.precision : 2;
        inputElem.type = "range";
        inputElem.min = args.min ? args.min.toString() : "0";
        inputElem.max = args.max ? args.max.toString() : "1";
        inputElem.step = args.step ? args.step.toString() : "0.01";
        inputElem.value = args.value ? args.value.toString() : "";
        textElem.innerHTML = text;
    }

    public get value() { return parseFloat(this.input.value); }
    public set value(val: number) {
        this.input.value = val.toString(); 
        this._value.innerHTML = val.toFixed(this.precision);
    }
}


export class SliderDoubleBinding {
    protected slider: SliderElement
    protected eventId: Events.ID;
    protected settingsId: Settings.ID;

    constructor(slider: SliderElement, eventId: Events.ID, settingsId: Settings.ID) {
        this.slider = slider;
        this.eventId = eventId;
        this.settingsId = settingsId;

        slider.value = Settings.getValue(settingsId);

        slider.input.addEventListener("input", this.onUInput);
        Settings.subscribe(settingsId, this.onSettingsChange);
    }
    
    protected onSettingsChange = (val: any) => {
        this.slider.value = val;
    }

    protected onUInput = () => {
        const value = this.slider.value;
        Events.broadcast(this.eventId, value);
    }
}





class ColorAreaPicker {
    protected element: HTMLDivElement;

    constructor(id: string) {
        this.element = <HTMLDivElement>document.getElementById(id);
    }

    public setColor(rgb: Rgb, position: Vec2) {
        console.assert(rgb != null);

        this.element.style.left = `${(position.x-5)}px`;
        this.element.style.top = `${(position.y-5)}px`;
        const gray = rgb.toGray();
        const borderColor = gray > .5 ? 0 : 255;
        this.element.style.borderColor = `rgb(${borderColor}, ${borderColor}, ${borderColor})`;
    }
}


class ColorAreaDoubleBinding {
    protected element: HTMLDivElement;
    protected pickerElement: ColorAreaPicker;
    protected isPointerDown = false;

    constructor(elementId: string, pickerId: string) {
        console.assert(elementId != null);
        console.assert(elementId !== "");
        console.assert(pickerId != null);
        console.assert(pickerId !== "");
        this.element = <HTMLDivElement>document.getElementById(elementId);
        this.pickerElement = new ColorAreaPicker(pickerId);
        this.element.addEventListener("pointerdown", this.pointerdown);
        document.body.addEventListener("pointerup", this.pointerup);
        document.body.addEventListener("pointermove", this.pointermove);
    }


    private pointerdown = (ev: PointerEvent) => {
        this.isPointerDown = true;
        this.pointermove(ev);
    }

    private pointerup = () => {
        this.isPointerDown = false;
    }


    private pointermove = (ev: PointerEvent) => {
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

        Events.broadcast(Events.ID.BrushSaturation, xpct);
        Events.broadcast(Events.ID.BrushValue, ypct);
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




class HueAreaSlider {
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
        document.body.addEventListener("pointerup", this.pointerup);
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

        Events.broadcast(Events.ID.BrushHue, xpct);
    }


    public setHue(hue: number) {
        const width = this.element.clientWidth;
        const x = Math.round(hue * width) - 1;
        this.sliderElement.style.left = `${x}px`;
    }
}


class ColorDisplay {
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



export class ColorSelectionArea {
    protected satValArea: ColorAreaDoubleBinding;
    protected hueSlider: HueAreaSlider;
    protected colorDisplay: ColorDisplay;

    protected color: Hsv;
    protected secondaryColor = Hsv.create(0, 0, 1);

    constructor() {
        this.satValArea = new ColorAreaDoubleBinding("pickingArea", "picker");
        this.hueSlider = new HueAreaSlider("hueArea", "hueAreaSlider");
        this.colorDisplay = new ColorDisplay("colorDisplayPrimary", "colorDisplaySecondary")

        this.colorDisplay.secondaryElem.addEventListener("pointerdown", () => {
            const tmp = this.color;
            this.color = this.secondaryColor;
            this.secondaryColor = tmp;
            this.colorDisplay.swapColors();

            Events.broadcast(Events.ID.BrushHue, this.color.h);
            Events.broadcast(Events.ID.BrushSaturation, this.color.s);
            Events.broadcast(Events.ID.BrushValue, this.color.v);
        });

        this.color = Hsv.create(
            Settings.getValue(Settings.ID.BrushHue),
            Settings.getValue(Settings.ID.BrushSaturation),
            Settings.getValue(Settings.ID.BrushValue)
        );

        this.satValArea.updateColor(this.color);
        this.hueSlider.setHue(this.color.h);
        this.colorDisplay.updateColor(this.getColorRgb());

        Events.subscribe(Events.ID.BrushHue, this.handleHue);
        Events.subscribe(Events.ID.BrushSaturation, this.handleSaturation);
        Events.subscribe(Events.ID.BrushValue, this.handleValue);
    }

    protected getColorRgb = () =>
        this.color
            .toRgb()
            .multiplyScalar(255)
            .round();

    protected handleHue = (value: number) => {
        console.assert(value >= 0);
        console.assert(value <= 1);
        this.color = this.color.withH(value);
        this.satValArea.updateColor(this.color);
        this.hueSlider.setHue(value);
        this.colorDisplay.updateColor(this.getColorRgb());
    }

    protected handleSaturation = (value: number) => {
        console.assert(value >= 0);
        console.assert(value <= 1);
        this.color = this.color.withS(value);
        this.satValArea.updateColor(this.color);
        this.colorDisplay.updateColor(this.getColorRgb());
    }

    protected handleValue = (value: number) => {
        console.assert(value >= 0);
        console.assert(value <= 1);
        this.color = this.color.withV(value);
        this.satValArea.updateColor(this.color);
        this.colorDisplay.updateColor(this.getColorRgb());
    }
}