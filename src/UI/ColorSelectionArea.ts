
import { Events } from "../Engine/Global/Events";
import { Settings } from "../Engine/Global/Settings";
import { Hsva, Hsv } from "../Engine/Math/Color";

import { ColorAreaDoubleBinding } from "./ColorSVArea"
import { ColorDisplay } from "./ColorDisplay"
import { HueSlider } from "./HueSlider"

export class ColorSelectionArea {
    protected satValArea: ColorAreaDoubleBinding;
    protected hueSlider: HueSlider;
    protected colorDisplay: ColorDisplay;

    protected color = Hsv.create(0, 0, 1);
    protected secondaryColor = this.color;

    constructor() {
        this.satValArea = new ColorAreaDoubleBinding("pickingArea", "picker");
        this.hueSlider = new HueSlider("hueArea", "hueAreaSlider");
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