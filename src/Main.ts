import { RenderingContext } from "./Engine/Rendering/RenderingContext";
import { Renderer } from "./Engine/Rendering/Renderer";
import { DrawPoint } from "./Engine/Rendering/DrawPoints";
import { Hsv, Hsva, Rgba } from "./Engine/Math/Color"
import { RNG } from "./Engine/Math/RNG";
import { BrushSettings } from "./Engine/App/BrushSettings";
import { AppContext } from "./Engine/App/AppContext";
import { BlendModeType } from "./Engine/Rendering/Consts";
import { InputData, InputSource, InputType } from "./Engine/Input/InputData";
import { InputCapture } from "./Engine/Input/InputCapture";
import { Vec2 } from "./Engine/Math/Vec";
import { Settings } from "./Engine/Global/Settings";
import { Events } from "./Engine/Global/Events";
import { ToolType } from "./Engine/App//Tools";
import { List, Iterable } from "immutable";

export let dotsPerFrame = 100;
const frames = 2

export let appContext: AppContext;
let rng: RNG;
let canvas: HTMLCanvasElement;


function start() {
	rng = new RNG(1)
	canvas = <HTMLCanvasElement>document.getElementById("paintingArea");
	console.assert(canvas != null, `Canvas is ${canvas}`);
	canvas.width = Settings.rendering.canvasSize.value.x;
	canvas.height = Settings.rendering.canvasSize.value.y;
	const renderer = new Renderer(canvas, {
		alpha: true,
		depth: false,
		stencil: false,
		antialias: false,
		premultipliedAlpha: true,
		preserveDrawingBuffer: true,
		failIfMajorPerformanceCaveat: false
	});
	appContext = new AppContext(renderer);

	const inputCapture = new InputCapture(canvas);

	Events.pointer.drag.subscribe((input) => appContext.addInput(input));
	Events.pointer.down.subscribe((input) => appContext.addInput(input));
	Events.pointer.up.subscribe((input) => appContext.addInput(input));

	Events.tool.subscribe((tool) => appContext.useTool(tool));

	appContext.useTool(Settings.toolId.value);
	return appContext;
}

let frameCount = 0;
function animate() {
	const newPts = generateRandomPoints(rng, dotsPerFrame);
	appContext.addDrawPoints(newPts);
	if (frameCount < frames) {
		requestAnimationFrame(() => animate());
		frameCount++;
	}
	else {
		appContext.layerManager.setLayer(appContext.layerManager.stack.last());
		const points = generateRandomPoints(rng, dotsPerFrame);
		appContext.addDrawPoints(points);
	}
		appContext.requestRender();
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
				.7);
			break;

		default:
			hsva = Hsva.create(0, 0, 0, 1);
			break;

	}
	const color = hsva
		.toRgba()
		.powScalar(Settings.rendering.gamma.value);
	return color;
}





/*
	Sets the settings values from DEFAULT_SETTINGS
*/
function initSettingsValues() {
	Settings.brush.broadcast(
		new BrushSettings(
			Hsv.create(0.8, 0.9, 0.8),
			Hsv.create(0, 0, 1),
			0.6,	// density
			0.05,	// spacing
			120,	// size
			0.3,	// softness
			Vec2.create(1000, 1000)
		)
	)

	Settings.rendering.blendMode.broadcast(BlendModeType.Normal);
	Settings.rendering.canvasSize.broadcast(Vec2.create(1000, 1000));
	Settings.rendering.gamma.broadcast(2.2);
	Settings.rendering.maxDrawPoints.broadcast(10000);

	Settings.toolId.broadcast(ToolType.Brush);
}



import * as UI from "./UI/UI";


function main() {
	initSettingsValues();
	const context = start();
	UI.init(context);
	animate();
	Settings.brush.broadcast(Settings.brush.value);
}



window.onload = main;