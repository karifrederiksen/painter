/// <reference path="Rendering/Shaders/Common.ts"/>
/// <reference path="Rendering/Shaders/Shader.ts"/>
/// <reference path="Rendering/Consts.ts"/>

/// <reference path="Math/Color.ts"/>
/// <reference path="Global/Settings.ts"/>
/// <reference path="Global/Events.ts"/>

module TSPainter {
	// Settings for the app. These should be stored in cookies.
	export const DEFAULT_SETTINGS = {
		// Display
		CanvasWidth: 1000,
		CanvasHeight: 1000,
		Gamma: 2.2,

		// Brush
		BrushSize: 12,
		BrushPointSpacing: .01,
		BrushSoftness: 0.1,
		BrushHue: .8,
		BrushSaturation: 1,
		BrushValue: 0,
		BrushAlpha: .99,

		// Rendering
		RenderingMaxDrawPoints: 10000,
		RenderingBlendMode: BlendMode.Normal
	}

	
	export let dotsPerFrame = 10;

	/*
		Sets the settings values from DEFAULT_SETTINGS
	*/
	function initSettings() {
		const keys = Object.keys(DEFAULT_SETTINGS);
		let key;
		
		for (let i = 0, ilen = keys.length; i < ilen; i++) {
			Settings.setValue(i, DEFAULT_SETTINGS[Settings.ID[i]]);
		}
	}
	

	let rng: RNG;
	let canvas: HTMLCanvasElement;
	let renderingContext: CanvRenderingContext;
	let inputCapture: InputCapture;
	let interpolator: Interpolator;
	let renderingCoordinator: RenderingCoordinator;
	let svgContainer: SVGElement;
	let toolbar: Toolbar;

	function init() {
		rng = new RNG(1)
		canvas = getCanvasById("paintingArea");
		canvas.width = Settings.getValue(Settings.ID.CanvasWidth);
		canvas.height = Settings.getValue(Settings.ID.CanvasHeight);
		renderingContext = new CanvRenderingContext(canvas);
		inputCapture = new InputCapture(canvas);
		interpolator = new Interpolator(
			Settings.getValue(Settings.ID.RenderingMaxDrawPoints),
			Settings.getValue(Settings.ID.BrushPointSpacing) * renderingContext.brushTexture.width / 100
		);
		renderingCoordinator = new RenderingCoordinator(_render);


		Settings.subscribe(Settings.ID.BrushPointSpacing, (n: number) => {
			interpolator.spacingThresholdPx = n * Settings.getValue(Settings.ID.BrushPointSpacing);
		});

		Event.subscribe(Event.ID.MOUSE_MOVE, _onMouseMove);
		Event.subscribe(Event.ID.MOUSE_DRAG, _onMouseDrag);
		Event.subscribe(Event.ID.MOUSE_DOWN, _onMouseDown);
		Event.subscribe(Event.ID.MOUSE_UP, _onMouseUp);
		
		console.log();


		_drawPoint = new DrawPoint();
		_color = new ColorConverter();


		// setup UI
		svgContainer = getSvgById("uiSvg");
		svgContainer.setAttribute("width", canvas.width.toString());
		svgContainer.setAttribute("height", canvas.height.toString());
		toolbar = new Toolbar(svgContainer);
	}


	let n_ani = 0;
	function animate() {
		generateRandomPoints(interpolator.drawPoints, rng, dotsPerFrame);
		_render();
		if (n_ani < 200) {
			requestAnimationFrame(() => animate());
			n_ani++;
		}
		else {

		}
	}

	let _drawPoint: DrawPoint;
	let _color: ColorConverter;
	function _updateDrawPoint(data: InputData) {
		_drawPoint.x = data.x;
		_drawPoint.y = data.y;
		_drawPoint.scale = data.pressure;
		_drawPoint.size = Settings.getValue(Settings.ID.BrushSize);
		_drawPoint.rotation = 0;

		generateColor(_color, rng);
		_drawPoint.setColor(_color.rgba);
	}

	const _onMouseMove = (data: InputData) => { }

	const _onMouseDrag = (data: InputData) => {
		_updateDrawPoint(data);
		interpolator.interpolate(_drawPoint);
		render();
	}

	const _onMouseDown = (data: InputData) => {
		_updateDrawPoint(data);
		interpolator.setInitialPoint(_drawPoint);
		render();
	}

	const _onMouseUp = (data: InputData) => {
		render();
	}

	function render() {
		renderingCoordinator.requestRender();
	}

	const _render = () => {
		if (interpolator.drawPoints.count() > 0) {
			renderingContext.renderDrawPoints(interpolator.drawPoints);
		}
	}


	// Starting point of the application
	export function main() {
		initSettings();
		init();
		animate();
	}


	export function toCanvasCoordinates(coords: Vec2) {

	}


	function generateRandomPoints(drawPoints: DrawPointQueue, rng: RNG, n: number) {
		
		const color = new ColorConverter();
        const colorHsva = color.hsva;

		let x, y, rotation, size;
		let drawPoint: DrawPoint;

        for (let i = 0; i < n; i++) {
			x = rng.next() * 1000;
			y = rng.next() * 1000;
			
			generateColor(color, rng);
			
            size = 10;
            rotation = rng.next() * Math.PI;

			drawPoint = drawPoints.newPoint();
			drawPoint.setColor(color.rgba);
			drawPoint.x = x;
			drawPoint.y = y;
			drawPoint.size = size;
			drawPoint.rotation = rotation;
        }
	}


	const colortest = 1;
	function generateColor(color: ColorConverter, rng: RNG) {
		const hsva = color.hsva;
		switch (colortest) {
			case 0:
				hsva.h = rng.next();
				hsva.s = .8 + .2 * rng.next();
				hsva.v = .7 + .3 * rng.next();
				hsva.a = 1;
				break;
			case 1:
				hsva.h = (Date.now() % 1000) / 1000;
				hsva.s = .7;
				hsva.v = 1;
				hsva.a = Settings.getValue(Settings.ID.BrushAlpha);
				hsva.a = hsva.a * .1 + expostep(hsva.a) * .9;
				break;
			case 2:
				hsva.h = Settings.getValue(Settings.ID.BrushHue);
				hsva.s = Settings.getValue(Settings.ID.BrushSaturation);
				hsva.v = Settings.getValue(Settings.ID.BrushValue);
				hsva.a = Settings.getValue(Settings.ID.BrushAlpha);
				hsva.a = hsva.a * .1 + expostep(hsva.a) * .9;
				break;
			default:
				hsva.h = 0;
				hsva.s = 0;
				hsva.v = 0;
				hsva.a = 1;
				break;

		}
		hsva.pow(Settings.getValue(Settings.ID.Gamma));
		color.toRgba();
	}
}

window.onload = TSPainter.main;