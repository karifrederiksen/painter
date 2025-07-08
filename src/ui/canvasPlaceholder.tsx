import type React from "react";
import { pct, useStream, type Send, type Stream } from "~/state";
import { v2 } from "~/util";
import { useRef } from "react";
import type { Renderer } from "~/state/renderer";
import type { DoViewportThings, ViewportTransforms } from "~/state/viewport";

export interface CanvasPlaceholderProps {
	transformsStream: Stream<ViewportTransforms>;
	rendererStream: Stream<Renderer | null>;
	send: Send<DoViewportThings>;
}

export function CanvasPlaceholder({
	transformsStream,
	rendererStream,
	send,
}: CanvasPlaceholderProps): React.JSX.Element {
	const trans = useStream(transformsStream);
	const renderer = useStream(rendererStream);
	const dragRef = useRef<null | { startCoord: v2; startOffset: v2 }>(null);

	if (renderer === null) return <></>;

	const { canvasSize } = renderer;
	const offset = trans.offset.mul(canvasSize).mulNum(0.5);

	const onWheel = (ev: React.WheelEvent<HTMLElement>) => {
		if (ev.deltaY === 0) return;

		if (ev.deltaY > 0) {
			send("viewport:zoom", pct(trans.zoom + 0.05));
		} else {
			send("viewport:zoom", pct(trans.zoom - 0.05));
		}
	};

	const handlePointer = (ev: React.PointerEvent<HTMLElement>) => {
		// middle button
		if (ev.buttons !== 4) {
			dragRef.current = null;
			return;
		}

		const tarect = ev.currentTarget.getBoundingClientRect();
		const eventCoord = v2.xy(ev.clientX, ev.clientY);
		const targetCoord = v2.xy(tarect.x, tarect.y);
		const normalizedCoord = eventCoord
			.sub(targetCoord)
			.div(canvasSize)
			.subNum(0.5)
			.mulNum(2);

		if (!dragRef.current) {
			dragRef.current = {
				startCoord: normalizedCoord,
				startOffset: trans.offset,
			};
		} else {
			const offset = normalizedCoord.sub(dragRef.current.startCoord);
			const newOffset = offset.add(dragRef.current.startOffset);
			send("viewport:translate", newOffset);
		}
	};
	return (
		<div
			className="fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center"
			onWheel={onWheel}
			onPointerDown={handlePointer}
			onPointerMove={handlePointer}
		>
			<div
				className="bg-gray-500"
				style={{
					width: canvasSize.x,
					height: canvasSize.y,
					transform: `translate(${offset.x}px, ${offset.y}px) scale(${trans.zoom * 100}%) rotate(${(trans.rotation * 360).toFixed(2)}deg)`,
				}}
			/>
		</div>
	);
}
