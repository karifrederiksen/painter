
import { Event } from "../Engine/Global/Events";
import { Settings, Setting } from "../Engine/Global/Settings";
import { Hsva } from "../Engine/Math/Color";
import { BrushSettings } from "../Engine/App/BrushSettings";

export interface SliderArgs {
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


    constructor(sliderId: string, text: string, args?: SliderArgs) {
        const inputElem  = this.input = <HTMLInputElement>document.getElementById(sliderId);
        const textElem = this._text = <HTMLSpanElement>document.getElementById(sliderId + "Text");
        this._value = <HTMLSpanElement>document.getElementById(sliderId + "Value");
        this.precision = args.precision ? args.precision : 2;
        inputElem.type = "range";
        inputElem.min = args.min != null ? args.min.toString() : "0";
        inputElem.max = args.max != null ? args.max.toString() : "1";
        inputElem.step = args.step != null ? args.step.toString() : "0.01";
        inputElem.value = args.value != null ? args.value.toString() : "";
        textElem.innerHTML = text;
    }

    public get value() { return parseFloat(this.input.value); }
    public set value(val: number) {
        this.input.value = val.toString(); 
        this._value.innerHTML = val.toFixed(this.precision);
    }
}

export class SliderDoubleBindingT<T> {
    protected slider: SliderElement
    protected eventId: (val: T) => number;
    protected onInput: (progress: number) => void;

    constructor(slider: SliderElement, setting: Setting<T>, event: (val: T) => number, onInput: (progress: number) => void) {
        this.slider = slider;
        this.onInput = onInput;
        this.eventId = event;

        slider.input.addEventListener("input", () => {
            const { value } = this.slider;
            this.onInput(value);
        });

        setting.subscribe((val: T) => {
            this.slider.value = this.eventId(val);
        });
    }
}