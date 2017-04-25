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



export let dotsPerFrame = 100;
export let frames = 0;

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
	renderingCoordinator = new RenderingCoordinator(_requestRender);
	

	Settings.brush.spacing.subscribe((n: number) => interpGen = interpolatorGenerator(brush.getSpacingPx()));

	Events.pointer.move.subscribe(_onMouseMove);
	Events.pointer.drag.subscribe(_onMouseDrag);
	Events.pointer.down.subscribe(_onMouseDown);
	Events.pointer.up.subscribe(_onMouseUp);

	Events.tool.subscribe(useTool);

	useTool(Settings.toolId.value);
	return renderingContext;
}

let frameCount = 0;
export function animate() {
	const newPts = generateRandomPoints(rng, dotsPerFrame);
	dpp = dpp.concat(newPts);
	_requestRender();
	if (frameCount < frames) {
		requestAnimationFrame(() => animate());
		frameCount++;
	}
	else {
		renderingContext.layerManager.setLayer(renderingContext.layerManager.stack.last());
		dpp = generateRandomPoints(rng, dotsPerFrame);
		_requestRender();
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


function _onMouseMove(data: InputData) { }

function _onMouseDrag(data: InputData) {
	const point = createDrawPoint(data);
	const result = interpolator(point);

	dpp = dpp.concat(result.values);
	interpolator = result.next(interpolator);

	render();
}

function _onMouseDown(data: InputData) {
	const point = createDrawPoint(data);
	interpolator = interpGen(point);
	dpp = List([ point ]);
	render();
}

function _onMouseUp(data: InputData)  {
	render();
}

function render() {
	renderingCoordinator.requestRender();
}


// rendering callback
function _requestRender() {
	if (dpp.count() > 0) {
		renderingContext.renderDrawPoints(dpp, brush.getTexture());
		dpp = List<DrawPoint>();
	}
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


function generateColor(rng: RNG) {
	let hsva: Hsva;
	switch (parseInt("0")) {
		case 0:
		hsva = Hsva.create(
			rng.next(),
			.8 + .2 * rng.next(),
			.7 + .3 * rng.next(),
			.7 + .3 * rng.next());
		break;

		case 1:
		hsva = Hsva.create(
			(Date.now() % 1000) / 1000,
			.7,
			1,
			Settings.brush.color.value.a);
		break;

		case 2:
		hsva = Settings.brush.color.value;
		break;

		default:
		hsva = Hsva.create(0, 0, 0, 1);
		break;

	}
	return hsva
		.toRgba()
		.powScalar(Settings.rendering.gamma.value);
}


function useTool(tool: Tools) {
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




import * as UI from "./UI/UI";




function main() {
	initSettingsValues();
	const context = start();
	UI.init(context);
	animate();
}



window.onload = main;