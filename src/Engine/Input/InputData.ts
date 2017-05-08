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

export class PointerData {
	public constructor(
		public readonly position: Vec2,
		public readonly pressure: number,
		public readonly tilt: Vec2
	){
		Object.freeze(this);
	}
}


export class InputMods {
	public constructor(
		public readonly shift: boolean,
		public readonly alt: boolean,
		public readonly ctrl: boolean
	){
		Object.freeze(this);
	}
}

export class InputData {
	public constructor(
		public readonly source: InputSource,
		public readonly whichKey: number,
		public readonly type: InputType,
		public readonly mods: InputMods,
		public readonly positionData: PointerData
	){
		Object.freeze(this);
	}
}