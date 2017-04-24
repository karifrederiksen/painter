

import { RenderingContext } from "./Engine/Rendering/RenderingContext";
import { DrawPoint } from "./Engine/Rendering/DrawPoints";
import { Hsv, Hsva, Rgba } from "./Engine/Math/Color"
import { valueOr } from "./Engine/Common";
import { RNG } from "./Engine/Math/RNG";
import { Brush } from "./Engine/App/Brush";
import { BlendModeType } from "./Engine/Rendering/Consts";
import { InputData, InputSource, InputType } from "./Engine/Input/InputData";
import { InputCapture } from "./Engine/Input/InputCapture";
import { Interpolator, InterpolatorGenerator, interpolatorGenerator } from "./Engine/Rendering/Interpolation";
import { RenderingCoordinator } from "./Engine/Rendering/RenderingCoordinator";
import { Tools } from "./Tools";
import { getCanvasById, getSvgById } from "./Engine/Misc/Misc";
import { Vec2 } from "./Engine/Math/Vec";
import { Settings } from "./Engine/Global/Settings";
import { Events } from "./Engine/Global/Events";
import { List, Iterable } from "immutable";



export const dotsPerFrame = 100;
export const frames = 0;

/*
	Sets the settings values from DEFAULT_SETTINGS
*/
export function initSettingsValues() {
	Settings.brush.color.broadcast(Hsva.create(0.8, 0.9, 0.8, 1.0));
	Settings.brush.density.broadcast(0.7);
	Settings.brush.size.broadcast(120);
	Settings.brush.softness.broadcast(0.7);
	Settings.brush.spacing.broadcast(0.05);
	Settings.brush.textureSize.broadcast(Vec2.create(1000, 1000));

	Settings.rendering.blendMode.broadcast(BlendModeType.Normal);
	Settings.rendering.canvasSize.broadcast(Vec2.create(1000, 1000));
	Settings.rendering.gamma.broadcast(2.2);
	Settings.rendering.maxDrawPoints.broadcast(10000);

	Settings.toolId.broadcast(Tools.Brush);
}


let rng: RNG;
let canvas: HTMLCanvasElement;
let renderingContext: RenderingContext;
let inputCapture: InputCapture;
let interpGen: InterpolatorGenerator;
let interpolator: Interpolator;
let dpp: Iterable<number, DrawPoint> = List<DrawPoint>();
let renderingCoordinator: RenderingCoordinator;
let brush: Brush;

export function start() {
	rng = new RNG(1)
	canvas = getCanvasById("paintingArea");
	canvas.width = Settings.rendering.canvasSize.value.x;
	canvas.height = Settings.rendering.canvasSize.value.y;
	renderingContext = new RenderingContext(canvas);
	inputCapture = new InputCapture(canvas);

	brush = new Brush(renderingContext.renderer);

	interpGen = interpolatorGenerator(brush.getSpacingPx());
	renderingCoordinator = new RenderingCoordinator(_render);
	

	Settings.brush.spacing.subscribe((n: number) => interpGen = interpolatorGenerator(brush.getSpacingPx()));

	Events.pointer.move.subscribe(_onMouseMove);
	Events.pointer.drag.subscribe(_onMouseDrag);
	Events.pointer.down.subscribe(_onMouseDown);
	Events.pointer.up.subscribe(_onMouseUp);

	Events.tool.subscribe(useTool);

	useTool(Settings.toolId.value);
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
		renderingContext.layerManager.setLayer(renderingContext.layerManager.stack.get(1));
		dpp = generateRandomPoints(rng, dotsPerFrame);
		_render();
	}
}

function createDrawPoint(data: InputData) {
	return new DrawPoint(
		data.positionData.position,
		Settings.brush.size.value,
		data.positionData.pressure,
		0,
		brush.getColorRgba()
	);
}


const _onMouseMove = (data: InputData) => { }

const _onMouseDrag = (data: InputData) => {
	const point = createDrawPoint(data);
	const result = interpolator(point);

	dpp = dpp.concat(result.values);
	interpolator = result.next(interpolator);

	render();
}

const _onMouseDown = (data: InputData) => {
	const point = createDrawPoint(data);
	interpolator = interpGen(point);
	dpp = List([ point ]);
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
	if (dpp.count() > 0) {
		renderingContext.renderDrawPoints(dpp, brush.getTexture());
		dpp = List<DrawPoint>();
	}
}

export function useBrush() {
	Events.tool.broadcast(Tools.Brush);
}

export function useEraser() {
	Events.tool.broadcast(Tools.Eraser);
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
	return List(arr);
}


let colortest = 0;
function generateColor(rng: RNG) {
	const gamma = Settings.rendering.gamma.value;
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
			a = Settings.brush.density.value;
			break;
		case 2:
			const color = Settings.brush.color.value;
			h = color.h;
			s = color.s;
			v = color.v;
			a = Settings.brush.density.value;
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


const useTool = (tool: Tools) => {
	switch(tool) {
		case Tools.Eraser:
			renderingContext.blendMode = BlendModeType.Erase;
			break;
		case Tools.Brush:
		default:
			renderingContext.blendMode = BlendModeType.Normal;
			break;
	}
	Settings.toolId.broadcast(tool);
}





import { 
	ColorSelectionArea, 
	SliderDoubleBinding, 
	SliderDoubleBindingColor,
	SliderDoubleBindingArgs, 
	SliderElement
} from "./UI";


// UI


let brushHueSlider:			SliderDoubleBindingColor;
let brushSaturationSlider:	SliderDoubleBindingColor;
let brushValueSlider:		SliderDoubleBindingColor;
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

	document.getElementById("btn-useBrush").addEventListener("pointerdown", () => useBrush());
	document.getElementById("btn-useEraser").addEventListener("pointerdown", () => useEraser());
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