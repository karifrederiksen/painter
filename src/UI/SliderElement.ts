
import { Event } from "../Engine/Global/Events";
import { Settings, Setting } from "../Engine/Global/Settings";
import { Hsva } from "../Engine/Math/Color";

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