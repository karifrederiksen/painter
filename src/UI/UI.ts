import { Events, Event } from "../Engine/Global/Events";
import { Settings, Setting } from "../Engine/Global/Settings";

import { SliderDoubleBinding, SliderDoubleBindingColor, SliderDoubleBindingArgs, SliderElement } from "./SliderElement"
import { ColorSelectionArea } from "./ColorSelectionArea";
import { UILayers } from "./Layers";

import { BlendModeType } from "../Engine/Rendering/Consts";
import { RenderingContext } from "../Engine/Rendering/RenderingContext";
import { Tools } from "../Tools";



let brushHueSlider:			SliderDoubleBindingColor;
let brushSaturationSlider:	SliderDoubleBindingColor;
let brushValueSlider:		SliderDoubleBindingColor;
let brushDensitySlider:		SliderDoubleBinding;
let brushSoftnessSlider:	SliderDoubleBinding;
let brushSpacingSlider:		SliderDoubleBinding;
let brushSizeSlider:		SliderDoubleBinding;


let colorPickerArea: ColorSelectionArea;

function initColorPicker() {
	colorPickerArea = new ColorSelectionArea();
}

function initSliders() {
    let args: SliderDoubleBindingArgs = {
		min: 0,
		max: 1,
		step: 0.0002,
		value: 0,
		precision: 4
	}
	let hueSliderEl = new SliderElement("hueSlider", "Hue", args);
	let satSliderEl = new SliderElement("saturationSlider", "Saturation", args);
	let valSliderEl = new SliderElement("valueSlider", "Value", args);
	let sofSliderEl = new SliderElement("softnessSlider", "Softness", args);
	args.min = 0.001;
	let denSliderEl = new SliderElement("densitySlider", "Density", args);
	let spaSliderEl = new SliderElement("spacingSlider", "Spacing", args);
	args.min = 1;
	args.max = 512;
	args.step = .1;
	args.precision = 1;
	let sizSliderEl = new SliderElement("sizeSlider", "Size", args);
	const settingColor = Settings.brush.color;
	brushHueSlider = new SliderDoubleBindingColor(hueSliderEl, 
		Events.brush.color, 
		settingColor, "h");
	brushSaturationSlider = new SliderDoubleBindingColor(satSliderEl, 
		Events.brush.color, 
		settingColor, "s");
	brushValueSlider = new SliderDoubleBindingColor(valSliderEl, 
		Events.brush.color, 
		settingColor, "v");
	brushDensitySlider = new SliderDoubleBinding(denSliderEl, 
		Events.brush.density, 
		Settings.brush.density);
	brushSoftnessSlider = new SliderDoubleBinding(sofSliderEl, 
		Events.brush.softness, 
		Settings.brush.softness);
	brushSpacingSlider = new SliderDoubleBinding(spaSliderEl, 
		Events.brush.spacing, 
		Settings.brush.spacing);
	brushSizeSlider = new SliderDoubleBinding(sizSliderEl, 
		Events.brush.size, 
		Settings.brush.size);

}

let layers: UILayers;
export function init(context: RenderingContext) {
    initSliders();
    initColorPicker();
	layers = new UILayers(context.layerManager.stack);

	document.getElementById("btn-useBrush").addEventListener("pointerdown", () => Events.tool.broadcast(Tools.Brush));
	document.getElementById("btn-useEraser").addEventListener("pointerdown", () => Events.tool.broadcast(Tools.Eraser));
}



