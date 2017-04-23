import { Vec2 } from "./Vec2";
import { Vec4 } from "./Vec4";

export module VecHelp {
	export function vec4HasPosition(vec: Vec4, pos: Vec2) {
		return vec.x === pos.x
			&& vec.y === pos.y;
	}

	export function vec4HasPosition2(vec: Vec4, x: number, y: number) {
		return vec.x === x
			&& vec.y === y;
	}

	export function vec4HasSize(vec: Vec4, size: Vec2) {
		return vec.z === size.x
			&& vec.w === size.y;
	}

	export function vec4HasSize2(vec: Vec4, x: number, y: number) {
		return vec.z === x
			&& vec.w === y;
	}

	export function vec4EqualsPrimitives(vec: Vec4, x: number, y: number, z: number, w: number) {
		return vec.x === x
			&& vec.y === y
			&& vec.z === z
			&& vec.w === w;
	}
}