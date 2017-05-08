
import { Settings } from "../Global/Settings";
import { Renderer } from "../Rendering/Renderer";
import { BlendModeType } from "../Rendering/Consts";
import { RenderingCoordinator } from "../Rendering/RenderingCoordinator";
import { RenderingContext } from "../Rendering/RenderingContext";
import { DrawPoint } from "../Rendering/DrawPoints";
import { InputData, InputSource, InputType } from "../Input/InputData";
import { Interpolator } from "./Interpolator";
import { BrushTool } from "./Brush";
import { BrushSettings, BrushSettingsArgs } from "./BrushSettings";
import { ToolType } from "./Tools";
import { List, Iterable } from "immutable";



export class AppContext {
	private readonly _renderingCoordinator: RenderingCoordinator;
	private readonly _renderingContext: RenderingContext;
	private readonly _interpolator = new Interpolator();
	private readonly _brush: BrushTool;

	public get layerManager() { return this._renderingContext.layerManager; }

	// exceedingly temporary
	public updateBrush(newSettings: BrushSettingsArgs) {
		const settings = this._brush.settings.set(newSettings);
		Settings.brush.broadcast(settings);
	}
	public updateBrushSwapColor() {
		const oldSettings = this._brush.settings
		const settings = oldSettings.set({
			primaryColor: oldSettings.secondaryColor,
			secondaryColor: oldSettings.primaryColor
		});
		Settings.brush.broadcast(settings);
	}


	constructor(renderer: Renderer) {
		this._renderingContext = new RenderingContext(renderer);
		this._brush = new BrushTool(renderer, Settings.brush.value);
		this._renderingCoordinator = new RenderingCoordinator(() => this._renderingContext.renderDrawPoints(this._brush.texture));

		Settings.brush.subscribe((settings) => {
			this._brush.update(renderer, settings);
		});
	}


	public addInput(data: InputData) {
		const newPoints = this._interpolator.next(this._brush.settings, data);
		this.addDrawPoints(newPoints);
		this.requestRender();
	}


	// very temporary
	public addDrawPoints(points: Iterable<number, DrawPoint>) {
		this._renderingContext.addDrawPoints(points);
		this._renderingCoordinator.requestRender();
	}


	public useTool(tool: ToolType) {
		const renderingContext = this._renderingContext;
		switch(tool) {
			case ToolType.Eraser:
				renderingContext.blendMode = BlendModeType.Erase;
				break;
			case ToolType.Brush:
			default:
				renderingContext.blendMode = BlendModeType.Normal;
				break;
		}
		Settings.toolId.broadcast(tool);
	}

	public requestRender() {
		this._renderingCoordinator.requestRender();
	}
}