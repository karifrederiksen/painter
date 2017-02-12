/// <reference path="Rendering/Shaders/Common.ts"/>
/// <reference path="Rendering/Shaders/Shader.ts"/>
/// <reference path="Rendering/Consts.ts"/>

/// <reference path="Math/Color.ts"/>
/// <reference path="Global/Settings.ts"/>
/// <reference path="Global/Events.ts"/>

module TSPainter {
	// Settings for the app. These should be stored in cookies.
	export const DEFAULT_SETTINGS = {
		None: undefined,

		// Display
		CanvasWidth: 1000,
		CanvasHeight: 1000,
		Gamma: 2.2,

		// Tool
		ToolId: 0,

		// Brush
		BrushTextureSize: 1000,
		BrushSize:       120,
		BrushSoftness:   0.2,
		BrushSpacing:    0.05,
		BrushDensity:    0.5,
		// Brush Color
		BrushHue:        0.8,
		BrushSaturation: 0.9,
		BrushValue:      0.8,

		// Rendering
		RenderingMaxDrawPoints: 10000,
		RenderingBlendMode: Rendering.BlendMode.Normal
	}

	
	export const dotsPerFrame = 100;


	// Starting point of the application
	export function main() {
		initSettingsValues();
		start();
		animate();
	}

	/*
		Sets the settings values from DEFAULT_SETTINGS
	*/
	function initSettingsValues() {
		for (let i = 0, ilen = Object.keys(DEFAULT_SETTINGS).length; i < ilen; i++) {
			Settings.setValue(i, DEFAULT_SETTINGS[Settings.ID[i]]);
		}
	}
	

	let rng: RNG;
	let canvas: HTMLCanvasElement;
	let renderingContext: Rendering.CanvRenderingContext;
	let inputCapture: InputCapture;
	let interpolator: Rendering.Interpolator;
	let renderingCoordinator: Rendering.RenderingCoordinator;
	let textureGenerator: Rendering.TextureGenerator;
	let brush: App.Brush;
	let containerSvg: UI.DisplayObjectContainer;
	let toolbar: UI.Toolbar;

	function start() {
		rng = new RNG(1)
		canvas = getCanvasById("paintingArea");
		canvas.width = Settings.getValue(Settings.ID.CanvasWidth);
		canvas.height = Settings.getValue(Settings.ID.CanvasHeight);
		renderingContext = new Rendering.CanvRenderingContext(canvas);
		inputCapture = new InputCapture(canvas);

		const bTexSize = Settings.getValue(Settings.ID.BrushTextureSize);
		brush = new App.Brush(new Rendering.Texture(renderingContext.renderer, bTexSize, bTexSize));
		textureGenerator = new Rendering.TextureGenerator(renderingContext.renderer, renderingContext.renderer.shaders.brushShader);
		textureGenerator.generate(brush.getTexture());

		interpolator = new Rendering.Interpolator(
			Settings.getValue(Settings.ID.RenderingMaxDrawPoints),
			brush.getSpacingPx()
		);
		renderingCoordinator = new Rendering.RenderingCoordinator(_render);
		

		Settings.subscribe(Settings.ID.BrushSpacing, (n: number) => {
			brush.setSpacing(n);
			interpolator.spacingThresholdPx = brush.getSpacingPx();
		});

		Events.subscribe(Events.ID.PointerMove, _onMouseMove);
		Events.subscribe(Events.ID.PointerDrag, _onMouseDrag);
		Events.subscribe(Events.ID.PointerDown, _onMouseDown);
		Events.subscribe(Events.ID.PointerUp, _onMouseUp);

		Events.subscribe(Events.ID.ButtonToolBrush, () => useTool(Tools.Brush));
		Events.subscribe(Events.ID.ButtonToolEraser, () => useTool(Tools.Eraser));
		Events.subscribe(Events.ID.ButtonToolBlur, () => useTool(Tools.Blur));

		_drawPoint = new Rendering.DrawPoint();
		_color = new ColorConverter();


		// setup UI
		const wSvg = new UI.WrappedSVG(getSvgById("uiSvg"))
			.setWidth(canvas.width)
			.setHeight(canvas.height);
		containerSvg = new UI.DisplayObjectContainer(wSvg);
		containerSvg.description = "UI Scene";
		toolbar = new UI.Toolbar(containerSvg, 0, 0); 
		useTool(Settings.getValue(Settings.ID.ToolId));
	}


	let frameCount = 0;
	function animate() {
		generateRandomPoints(interpolator.drawPoints, rng, dotsPerFrame);
		_render();
		if (frameCount < 2) {
			requestAnimationFrame(() => animate());
			frameCount++;
		}
		else {

		}
	}

	let _drawPoint: Rendering.DrawPoint;
	let _color: ColorConverter;
	function _updateDrawPoint(data: InputData) {
		_drawPoint.x = data.x;
		_drawPoint.y = data.y;
		_drawPoint.scale = data.pressure;
		_drawPoint.size = Settings.getValue(Settings.ID.BrushSize);
		_drawPoint.rotation = 0;
		_drawPoint.setColor(brush.getColorRgba());
	}

	const _onMouseMove = (data: InputData) => { }

	const _onMouseDrag = (data: InputData) => {
		_updateDrawPoint(data);
		if (containerSvg.drag(data.x, data.y, data.pressure) === false) {
			interpolator.interpolate(_drawPoint);
		}
		render();
	}

	const _onMouseDown = (data: InputData) => {
		_updateDrawPoint(data);
		if (containerSvg.click(data.x, data.y, data.pressure, true) === false) {
			interpolator.setInitialPoint(_drawPoint);
		}
		render();
	}

	const _onMouseUp = (data: InputData) => {
		containerSvg.release(data.x, data.y);
		render();
	}

	function render() {
		renderingCoordinator.requestRender();
	}


	// rendering callback
	const _render = () => {
		if (interpolator.drawPoints.count() > 0) {
			renderingContext.renderDrawPoints(interpolator.drawPoints, brush.getTexture());
		}
	}


	function generateRandomPoints(drawPoints: Rendering.DrawPointQueue, rng: RNG, n: number) {
		
		const color = new ColorConverter();

		let x, 
			y, 
			rotation, 
			size = 100;
		let drawPoint: Rendering.DrawPoint;

        for (let i = 0; i < n; i++) {
			x = rng.next() * 1000;
			y = rng.next() * 1000;
			
			generateColor(color, rng);
			
            rotation = rng.next() * Math.PI;

			drawPoint = drawPoints.newPoint();
			drawPoint.setColor(color.rgba);
			drawPoint.x = x;
			drawPoint.y = y;
			drawPoint.size = size;
			drawPoint.rotation = rotation;
        }
	}


	let colortest = 0;
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
				hsva.a = Settings.getValue(Settings.ID.BrushDensity);
				break;
			case 2:
				hsva.h = Settings.getValue(Settings.ID.BrushHue);
				hsva.s = Settings.getValue(Settings.ID.BrushSaturation);
				hsva.v = Settings.getValue(Settings.ID.BrushValue);
				hsva.a = Settings.getValue(Settings.ID.BrushDensity);
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


	function useTool(tool: Tools) {
		switch(tool) {
			case Tools.Eraser:
				renderingContext.blendMode = Rendering.BlendMode.Erase;
				break;
			case Tools.Brush:
			default:
				renderingContext.blendMode = Rendering.BlendMode.Normal;
				break;
		}
		Settings.setValue(Settings.ID.ToolId, tool);
	}
}

window.onload = TSPainter.main;