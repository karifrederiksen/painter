
import { Events } from "../Engine/Global/Events";
import { Settings } from "../Engine/Global/Settings";
import { Hsva, Hsv } from "../Engine/Math/Color";

import { ColorAreaDoubleBinding } from "./ColorSVArea"
import { ColorDisplay } from "./ColorDisplay"
import { BrushSettings } from "../Engine/App/BrushSettings";
import { HueSlider } from "./HueSlider"

export class ColorSelectionArea {
    protected satValArea: ColorAreaDoubleBinding;
    protected hueSlider: HueSlider;
    protected colorDisplay: ColorDisplay;

    protected color = Hsv.create(0, 0, 1);
    protected secondaryColor = this.color;
    protected onColorChange: (hsv: Hsv) => void;
    protected onColorSwap: () => void;


    constructor(onColorChange: (hsv: Hsv) => void, onColorSwap: () => void) {
        this.onColorChange = onColorChange;
        this.onColorSwap = onColorSwap;

        this.satValArea = new ColorAreaDoubleBinding((hsv) => {
            onColorChange(hsv);
        });
        this.hueSlider = new HueSlider((hsv) => {
            onColorChange(hsv);
        });
        this.colorDisplay = new ColorDisplay(() => this.swapColors())

        this.handleColor(Settings.brush.value);

        Settings.brush.subscribe((settings) => this.handleColor(settings));
    }

    protected swapColors() {
        this.colorDisplay.swapColors();
        this.onColorSwap();
    }

    protected handleColor(settings: BrushSettings) {
        const color = settings.primaryColor;
        console.assert(color.isInRange(0, 1), `HSVA color has invalid value: ${color}. Expected all values to be in range [0..1]`)
        const hsv = color;
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