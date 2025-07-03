import React from "react";
import type { Send } from "~/state";
import { Vec2 } from "~/util";

export interface MinimapProps {
	send: Send;
}

export function Minimap({ send }: MinimapProps): React.JSX.Element {
	function handlePointer(ev: React.PointerEvent<HTMLElement>) {
		// left click
		if (ev.buttons !== 1) return;

		const tarect = ev.currentTarget.getBoundingClientRect();
		const evPt = new Vec2(ev.clientX, ev.clientY);
		const targetPt = new Vec2(tarect.x, tarect.y);
		const targetSize = new Vec2(tarect.width, tarect.height);
		const localPt = evPt.subtract(targetPt);
		const pct = localPt.divide(targetSize);

		const viewSpace = pct.multiplyScalar(-2).addScalar(1);

		send("viewport:translate", viewSpace);
	}

	return (
		<div
			className="w-full aspect-square bg-gray-500"
			onPointerDown={handlePointer}
			onPointerMove={handlePointer}
		/>
	);
}
