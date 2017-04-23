import { Vec2 } from "../Math/Vec";

export const enum InputSource {
	Pointer,
	Keyboard,
	Pen,
	Touch
}

export const enum InputType {
	// Mouse
	Down,
	Up,
	Move,
	Drag
}

export class InputPositionData {
	public constructor(
		public position: Vec2,
		public pressure: number,
		public tilt: Vec2
	){
		Object.freeze(this);
	}
}


export class InputMods {
	public constructor(
		public shift: boolean,
		public alt: boolean,
		public ctrl: boolean
	){
		Object.freeze(this);
	}
}

export class InputData {
	public constructor(
		public source: InputSource,
		public whichKey: number,
		public type: InputType,
		public mods: InputMods,
		public positionData: InputPositionData
	){
		Object.freeze(this);
	}
}