
import { Events, Event } from "./Engine/Global/Events";
import { Settings, Setting } from "./Engine/Global/Settings";

import { Vec2, Vec3 } from "./Engine/Math/Vec";
import { Hsva, Hsv, Rgb, Color } from "./Engine/Math/Color";
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
    protected event: Event<number>;
    protected setting: Setting<number>;

    constructor(slider: SliderElement, event: Event<number>, setting: Setting<number>) {
        this.slider = slider;
        this.event = event;
        this.setting = setting;

        this.onSettingsChange(setting.value);

        slider.input.addEventListener("input", this.onUInput);
        setting.subscribe(this.onSettingsChange);
    }
    
    protected onSettingsChange = (val: number) => {
        this.slider.value = parseFloat(val.toString());
    }

    protected onUInput = () => {
        const value = this.slider.value;
        this.event.broadcast(value);
    }
}

type HsvaParts = "h"|"s"|"v"|"a";
export class SliderDoubleBindingColor {
    protected slider: SliderElement
    protected eventId: Event<Hsva>;
    protected setting: Setting<Hsva>;
    protected hsvaComponent: HsvaParts;

    constructor(slider: SliderElement, event: Event<Hsva>, setting: Setting<Hsva>, element: HsvaParts) {
        this.slider = slider;
        this.eventId = event;
        this.setting = setting;
        this.hsvaComponent = element;

        this.onSettingsChange(setting.value);

        slider.input.addEventListener("input", this.onUInput);
        setting.subscribe(this.onSettingsChange);
    }
    
    protected onSettingsChange = (val: Hsva) => {
        let a: number;
        switch(this.hsvaComponent) {
            case "h": a = val.h; break;
            case "s": a = val.s; break;
            case "v": a = val.v; break;
            case "a": a = val.a; break;
            default: throw "???";

        }
        this.slider.value = a;
    }

    protected onUInput = () => {
        const value = this.slider.value;
        const color = Settings.brush.color.value;
        let newColor: Hsva;
        switch(this.hsvaComponent) {
            case "h": newColor = color.withH(value); break;
            case "s": newColor = color.withS(value); break;
            case "v": newColor = color.withV(value); break;
            case "a": newColor = color.withA(value); break;
            default: throw "???";

        }
        this.eventId.broadcast(newColor);
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

        
        const oldColor = Settings.brush.color.value;
        const newColor = Hsva.create(oldColor.h, xpct, ypct, oldColor.a);

        Events.brush.color.broadcast(newColor);
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

    protected color = Hsv.create(0, 0, 1);
    protected secondaryColor = this.color;

    constructor() {
        this.satValArea = new ColorAreaDoubleBinding("pickingArea", "picker");
        this.hueSlider = new HueAreaSlider("hueArea", "hueAreaSlider");
        this.colorDisplay = new ColorDisplay("colorDisplayPrimary", "colorDisplaySecondary")

        this.colorDisplay.secondaryElem.addEventListener("pointerdown", this.swapColors);

        this.handleColor(Settings.brush.color.value);

        Events.brush.color.subscribe(this.handleColor);
    }

    protected swapColors = () => {
        const tmp = this.color;
        this.color = this.secondaryColor;
        this.secondaryColor = tmp;
        this.colorDisplay.swapColors();


        const oldColor = Settings.brush.color.value;
        Events.brush.color.broadcast(Hsva.createWithHsv(this.color, oldColor.a));
    }

    protected handleColor = (value: Hsva) => {
        console.assert(value.isZeroToOne(), `HSVA color has invalid value: ${value}. Expected all values to be in range [0..1]`)
        const hsv = value.hsv;
        const rgb = hsv
            .toRgb()
            .multiplyScalar(255)
            .round();

        this.color = hsv;
        this.satValArea.updateColor(hsv);
        this.hueSlider.setHue(hsv.h);
        this.colorDisplay.updateColor(rgb);
    }
}