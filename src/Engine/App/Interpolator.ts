
import { Rgba } from "../Math/Color";
import { InterpolateFunc, interpolatorGenerator, InterpolatorResult } from "./Interpolation";
import { DrawPoint } from "../Rendering/DrawPoints";
import { BrushTool } from "../App/Brush";
import { BrushSettings, densityToAlpha } from "../App/BrushSettings";
import { InputData, InputType } from "../Input/InputData";
import { List } from "immutable";



// Is this how you make a state machine? 


export const enum InterpolatorStates {
	Stopped,
	Started
}

interface StateChangeResult {
	results: InterpolatorResult;
	state: InterpolatorStates;
}

export class Interpolator {
	protected _interpolate: InterpolateFunc;
	protected _state = InterpolatorStates.Stopped;

	public get isInProgress() { return this._state === InterpolatorStates.Started; }
	public get state() { return this._state; }
	
	public next(settings: BrushSettings, data: InputData): List<DrawPoint> {
		let results: StateChangeResult;
		switch(this._state) {
			case InterpolatorStates.Stopped:
			results = stopped(settings, data);
			break;
			case InterpolatorStates.Started:
			results = started(settings, data, this._interpolate);
			break;
		}
		this._interpolate = results.results.next(this._interpolate);
		this._state = results.state;
		return results.results.values;
	}
}


function stopped(settings: BrushSettings, data: InputData): StateChangeResult {
	if (data.type === InputType.Up) {
		return {
			results: new InterpolatorResult(List<DrawPoint>(), () => null),
			state: InterpolatorStates.Stopped
		};
	}
	const spacingPx = settings.spacing * settings.size;
	const interpGen = interpolatorGenerator(spacingPx);
	const point = createDrawPoint(settings, data);
	const interpolate = interpGen(point);
	return {
		results: new InterpolatorResult(List([point]), () => interpolate),
		state: InterpolatorStates.Started
	};
}


function started(settings: BrushSettings, data: InputData, interpolate: InterpolateFunc): StateChangeResult {
	const point = createDrawPoint(settings, data);
	const results = interpolate(point);
	if (data.type === InputType.Up) {
		return {
			results: results,
			state: InterpolatorStates.Stopped
		};
	}
	return {
		results: results,
		state: InterpolatorStates.Started
	};
}


function createDrawPoint(settings: BrushSettings, data: InputData) {
	const { position, pressure } = data.positionData;
	return new DrawPoint(
		position,
		settings.size,
		pressure,
		0,
		getBrushColorRgba(settings)
	);
}

function getBrushColorRgba(settings: BrushSettings) {
	const rgb = settings.primaryColor.toRgb();
	const alpha = densityToAlpha(settings.density);
	return Rgba.createWithRgb(rgb, alpha);
}