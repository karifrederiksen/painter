import type { Color } from "color";
import type React from "react";
import { useStream, type Send, type Stream } from "~/state";
import type { DoBrushThings } from "~/state/brushes";

export interface ColorSelectorProps {
	color$: Stream<Color>;
	send: Send<DoBrushThings>;
}

export function ColorSelector({
	color$,
}: ColorSelectorProps): React.JSX.Element {
	const color = useStream(color$);
	return (
		<div className="w-full aspect-square bg-gray-500" title={color.toStyle()} />
	);
}
