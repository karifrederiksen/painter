import { Events, Event } from "../Engine/Global/Events";
import { Settings, Setting } from "../Engine/Global/Settings";

import { BrushSettings } from "../Engine/App/BrushSettings";

import {  SliderDoubleBindingT, SliderArgs, SliderElement } from "./SliderElement"
import { ColorSelectionArea } from "./ColorSelectionArea";
import { UILayers } from "./Layers";

import { BlendModeType } from "../Engine/Rendering/Consts";
import { AppContext } from "../Engine/App/AppContext";
import { ToolType } from "../Engine/App/Tools";



let brushDensitySlider:		SliderDoubleBindingT<BrushSettings>;
let brushSoftnessSlider:	SliderDoubleBindingT<BrushSettings>;
let brushSpacingSlider:		SliderDoubleBindingT<BrushSettings>;
let brushSizeSlider:		SliderDoubleBindingT<BrushSettings>;
let colorPickerArea:		ColorSelectionArea;

function initColorPicker(context: AppContext) {
	colorPickerArea = new ColorSelectionArea(
		(hsv) => {
			context.updateBrush({
				primaryColor: hsv
			});
		},
		() => {
			context.updateBrushSwapColor();
		}
	);
}

function createSliderDoubleBindingFunc<T>(setting: Setting<T>) {
	return (slider: SliderElement, event: (val: T) => number, onInput: (progress: number) => void) => {
		return new SliderDoubleBindingT<T>(slider, setting, event, onInput);
	}
}

function initSliders(context: AppContext) {
    let args: SliderArgs = {
		min: 0,
		max: 1,
		step: 0.002,
		value: 0,
		precision: 4
	}
	let sofSliderEl = new SliderElement("softnessSlider", "Softness", args);
	args.min = 0.01;
	let denSliderEl = new SliderElement("densitySlider", "Density", args);
	let spaSliderEl = new SliderElement("spacingSlider", "Spacing", args);
	args.min = 1;
	args.max = 512;
	args.step = .1;
	args.precision = 1;
	let sizSliderEl = new SliderElement("sizeSlider", "Size", args);
	const createSlider = createSliderDoubleBindingFunc(Settings.brush);

	brushDensitySlider = createSlider(denSliderEl, 
		(val: BrushSettings) => {
			return val.density;
		},
		(progress: number) => {
			context.updateBrush({
				density: progress
			});
		});
	brushSoftnessSlider = createSlider(sofSliderEl, 
		(val: BrushSettings) => {
			return val.softness;
		},
		(progress: number) => {
			context.updateBrush({
				softness: progress
			});
		});
	brushSpacingSlider = createSlider(spaSliderEl, 
		(val: BrushSettings) => {
			return val.spacing;
		},
		(progress: number) => {
			context.updateBrush({
				spacing: progress
			});
		});
	brushSizeSlider = createSlider(sizSliderEl, 
		(val: BrushSettings) => {
			return val.size;
		},
		(progress: number) => {
			context.updateBrush({
				size: progress
			});
		});

}

let layers: UILayers;
export function init(context: AppContext) {
    initSliders(context);
    initColorPicker(context);
	layers = new UILayers(context.layerManager.stack, {
		create: () => context.layerManager.newLayer(),
		delete: () => {},
		moveDown: () => {},
		moveUp: () => {},
		toggleVisibility: () => context.layerManager.toggleVisibility()
	});

	document.getElementById("btn-useBrush").addEventListener("pointerdown", () => Events.tool.broadcast(ToolType.Brush));
	document.getElementById("btn-useEraser").addEventListener("pointerdown", () => Events.tool.broadcast(ToolType.Eraser));
}



