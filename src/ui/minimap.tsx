import React from "react";
import type { Send } from "~/state";
import type { DoViewportThings } from "~/state/viewport";
import { v2 } from "~/util";

export interface MinimapProps {
	send: Send<DoViewportThings>;
}

export function Minimap({ send }: MinimapProps): React.JSX.Element {
	function handlePointer(ev: React.PointerEvent<HTMLElement>) {
		// left click
		if (ev.buttons !== 1) return;

		const tarect = ev.currentTarget.getBoundingClientRect();
		const evPt = v2.xy(ev.clientX, ev.clientY);
		const targetPt = v2.xy(tarect.x, tarect.y);
		const targetSize = v2.xy(tarect.width, tarect.height);
		const localPt = evPt.sub(targetPt);
		const pct = localPt.div(targetSize);

		const viewSpace = pct.mulNum(-2).addNum(1);

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
