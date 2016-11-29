/// <reference path = "../Math/Vec2.ts"/>

module TSPainter {
    export enum InputInterface {
        Mouse,
        Keyboard,
        Pen,
        Touch
    }

	export enum InputType {
		// Mouse
        Down,
		Up,
		Move,
		Drag
    }

    export class InputData extends Vec2 {
        public interf = InputInterface.Keyboard;
        public type = InputType.Down;
        public whichKey = 0;
        public x = 0;
        public y = 0;
        public shift = false;
        public alt = false;
        public ctrl = false;
        public pressure = 1;
        public tiltX = 0;
        public tiltY = 0;
		

        public setMods(shift: boolean, alt: boolean, ctrl: boolean) {
            this.shift = shift;
            this.alt = alt;
            this.ctrl = ctrl;
        }


        public setPenData(pressure: number, tiltX: number, tiltY: number) {
            this.pressure = pressure;
            this.tiltX = tiltX;
            this.tiltY = tiltY;
        }
    }
}