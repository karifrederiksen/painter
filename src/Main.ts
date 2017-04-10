import { 
	ColorSelectionArea, 
	SliderDoubleBinding, 
	SliderDoubleBindingArgs, 
	SliderElement
} from "./UI";

import { CanvRenderingContext } from "./Engine/Rendering/CanvasRenderingContext";
import { DrawPoint } from "./Engine/Rendering/DrawPoints";
import { Hsv, Hsva, Rgba } from "./Engine/Math/Color"
import { RNG } from "./Engine/Math/RNG";
import { Brush } from "./Engine/App/Brush";
import { BlendMode } from "./Engine/Rendering/Consts";
import { InputData, InputSource, InputType } from "./Engine/Input/InputData";
import { InputCapture } from "./Engine/Input/InputCapture";
import { Interpolator, InterpolatorGenerator, interpolatorGenerator } from "./Engine/Rendering/Interpolation";
import { RenderingCoordinator } from "./Engine/Rendering/RenderingCoordinator";
import { Tools } from "./Tools";
import { getCanvasById, getSvgById } from "./Engine/Misc/Misc";
import { Vec2 } from "./Engine/Math/Vec";
import * as Settings from "./Engine/Global/Settings";
import * as Events from "./Engine/Global/Events";

// Settings for the app. These should be stored in cookies.
export const DEFAULT_SETTINGS: any = {

	// Display
	CanvasWidth: 1000,
	CanvasHeight: 1000,
	Gamma: 2.2,

	// Tool
	ToolId: 0,

	// Brush
	BrushTextureSize: 1000,
	BrushSize:       120,
	BrushSoftness:   0.7,
	BrushSpacing:    0.05,
	BrushDensity:    0.5,
	// Brush Color
	BrushHue:        0.8,
	BrushSaturation: 0.9,
	BrushValue:      0.8,

	// Rendering
	RenderingMaxDrawPoints: 10000,
	RenderingBlendMode: BlendMode.Normal
}


export const dotsPerFrame = 100;
export const frames = 0;

/*
	Sets the settings values from DEFAULT_SETTINGS
*/
export function initSettingsValues() {
	for (let i = 0, ilen = Object.keys(DEFAULT_SETTINGS).length; i < ilen; i++) {
		Settings.setValue(i, DEFAULT_SETTINGS[Settings.ID[i]]);
	}
}


let rng: RNG;
let canvas: HTMLCanvasElement;
let renderingContext: CanvRenderingContext;
let inputCapture: InputCapture;
let interpGen: InterpolatorGenerator;
let interpolator: Interpolator;
let dpp = Array<DrawPoint>();
let renderingCoordinator: RenderingCoordinator;
let brush: Brush;

export function start() {
	rng = new RNG(1)
	canvas = getCanvasById("paintingArea");
	canvas.width = Settings.getValue(Settings.ID.CanvasWidth);
	canvas.height = Settings.getValue(Settings.ID.CanvasHeight);
	renderingContext = new CanvRenderingContext(canvas);
	inputCapture = new InputCapture(canvas);

	brush = new Brush(renderingContext.renderer);

	interpGen = interpolatorGenerator(brush.getSpacingPx());
	renderingCoordinator = new RenderingCoordinator(_render);
	

	Settings.subscribe(Settings.ID.BrushSpacing, (n: number) => {
		interpGen = interpolatorGenerator(brush.getSpacingPx());
	});

	Events.subscribe(Events.ID.PointerMove, _onMouseMove);
	Events.subscribe(Events.ID.PointerDrag, _onMouseDrag);
	Events.subscribe(Events.ID.PointerDown, _onMouseDown);
	Events.subscribe(Events.ID.PointerUp,	_onMouseUp);

	Events.subscribe(Events.ID.ButtonToolBrush,		() => useTool(Tools.Brush));
	Events.subscribe(Events.ID.ButtonToolEraser,	() => useTool(Tools.Eraser));
	Events.subscribe(Events.ID.ButtonToolBlur,		() => useTool(Tools.Blur));

	useTool(Settings.getValue(Settings.ID.ToolId));
}

let frameCount = 0;
export function animate() {
	const newPts = generateRandomPoints(rng, dotsPerFrame);
	dpp = dpp.concat(newPts);
	_render();
	if (frameCount < frames) {
		requestAnimationFrame(() => animate());
		frameCount++;
	}
	else {
		renderingContext.layer = renderingContext.layerStack.stack[1];
		dpp = generateRandomPoints(rng, dotsPerFrame);
		_render();
	}
}

function createDrawPoint(data: InputData) {
	return new DrawPoint(
		data.positionData.position,
		Settings.getValue(Settings.ID.BrushSize),
		data.positionData.pressure,
		0,
		brush.getColorRgba()
	);
}


const _onMouseMove = (data: InputData) => { }

const _onMouseDrag = (data: InputData) => {
	const point = createDrawPoint(data);
	const output = interpolator(point);
	dpp = dpp.concat(output);
	if (output.length > 0) {
		interpolator = interpGen(output[output.length - 1]);
	}
	render();
}

const _onMouseDown = (data: InputData) => {
	const point = createDrawPoint(data);
	interpolator = interpGen(point);
	dpp = [ point ];
	render();
}

const _onMouseUp = (data: InputData) => {
	render();
}

function render() {
	renderingCoordinator.requestRender();
}


// rendering callback
const _render = () => {
	if (dpp.length > 0) {
		renderingContext.renderDrawPoints(dpp, brush.getTexture());
		dpp = [];
	}
}

export function useBrush() {
	Events.broadcast(Events.ID.ButtonToolBrush, null);
}

export function useEraser() {
	Events.broadcast(Events.ID.ButtonToolEraser, null);
}

function generateRandomPoints(rng: RNG, n: number) {
	let arr = [];
	let color: Rgba;

	let x: number;
	let y: number; 
	let scale = 1;
	let rotation: number; 
	let size = 100;
	let drawPoint: DrawPoint;

	for (let i = 0; i < n; i++) {
		x = rng.next() * 1000;
		y = rng.next() * 1000;
		
		color = generateColor(rng);
		
		rotation = rng.next() * Math.PI;

		drawPoint = new DrawPoint(
			Vec2.create(x, y),
			size,
			scale,
			rotation,
			color
		);
		arr.push(drawPoint);
	}
	return arr;
}


let colortest = 0;
function generateColor(rng: RNG) {
	const gamma = Settings.getValue(Settings.ID.Gamma);
	let h: number;
	let s: number;
	let v: number;
	let a: number;
	switch (colortest) {
		case 0:
			h = rng.next();
			s = .8 + .2 * rng.next();
			v = .7 + .3 * rng.next();
			a = .7 + .3 * rng.next();
			break;
		case 1:
			h = (Date.now() % 1000) / 1000;
			s = .7;
			v = 1;
			a = Settings.getValue(Settings.ID.BrushDensity);
			break;
		case 2:
			h = Settings.getValue(Settings.ID.BrushHue);
			s = Settings.getValue(Settings.ID.BrushSaturation);
			v = Settings.getValue(Settings.ID.BrushValue);
			a = Settings.getValue(Settings.ID.BrushDensity);
			break;
		default:
			h = 0;
			s = 0;
			v = 0;
			a = 1;
			break;

	}
	return Hsva.create(h, s, v, a)
		.toRgba()
		.powScalar(gamma);
}


function useTool(tool: Tools) {
	switch(tool) {
		case Tools.Eraser:
			renderingContext.blendMode = BlendMode.Erase;
			break;
		case Tools.Brush:
		default:
			renderingContext.blendMode = BlendMode.Normal;
			break;
	}
	Settings.setValue(Settings.ID.ToolId, tool);
}








// UI


let brushHueSlider:			SliderDoubleBinding;
let brushSaturationSlider:	SliderDoubleBinding;
let brushValueSlider:		SliderDoubleBinding;
let brushDensitySlider:		SliderDoubleBinding;
let brushSoftnessSlider:	SliderDoubleBinding;
let brushSpacingSlider:		SliderDoubleBinding;
let brushSizeSlider:		SliderDoubleBinding;

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
	brushHueSlider = new SliderDoubleBinding(hueSliderEl, 
		Events.ID.BrushHue, 
		Settings.ID.BrushHue);
	brushSaturationSlider = new SliderDoubleBinding(satSliderEl, 
		Events.ID.BrushSaturation, 
		Settings.ID.BrushSaturation);
	brushValueSlider = new SliderDoubleBinding(valSliderEl, 
		Events.ID.BrushValue, 
		Settings.ID.BrushValue);
	brushDensitySlider = new SliderDoubleBinding(denSliderEl, 
		Events.ID.BrushDensity, 
		Settings.ID.BrushDensity);
	brushSoftnessSlider = new SliderDoubleBinding(sofSliderEl, 
		Events.ID.BrushSoftness, 
		Settings.ID.BrushSoftness);
	brushSpacingSlider = new SliderDoubleBinding(spaSliderEl, 
		Events.ID.BrushSpacing, 
		Settings.ID.BrushSpacing);
	brushSizeSlider = new SliderDoubleBinding(sizSliderEl, 
		Events.ID.BrushSize, 
		Settings.ID.BrushSize);
}


let colorPickerArea: ColorSelectionArea;

function initColorPicker() {
	colorPickerArea = new ColorSelectionArea();
}



function main() {
	initSettingsValues();
	start();
	initSliders();
	initColorPicker();
	animate();
}



window.onload = main;