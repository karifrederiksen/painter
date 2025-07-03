import type React from "react";
import {
	pct,
	useStream,
	type Send,
	type Stream,
	type ViewportTransforms,
} from "~/state";
import { Minimap } from "./minimap";
import { Label } from "~/components/ui/label";
import { formatPct } from "./util";
import { Slider } from "~/components/ui/slider";

export interface MinimapSectionProps {
	viewport$: Stream<ViewportTransforms>;
	send: Send;
}

export function MinimapSection({
	send,
	viewport$,
}: MinimapSectionProps): React.JSX.Element {
	const viewPortTransforms = useStream(viewport$);

	return (
		<>
			<Minimap send={send} />

			<div className="flex flex-row justify-between">
				<Label htmlFor="viewport-rotate">Rotation</Label>
				<div className="text-sm">{formatPct(viewPortTransforms.rotation)}</div>
			</div>
			<Slider
				id="viewport-rotate"
				min={0}
				max={1}
				step={0.005}
				value={[viewPortTransforms.rotation]}
				onValueChange={([rotation]) => send("viewport:rotate", pct(rotation))}
			/>

			<div className="flex flex-row justify-between">
				<Label htmlFor="viewport-zoom">Zoom</Label>
				<div className="text-sm">{formatPct(viewPortTransforms.zoom)}</div>
			</div>
			<Slider
				id="viewport-zoom"
				min={0.05}
				max={3}
				step={0.01}
				value={[viewPortTransforms.zoom]}
				onValueChange={([zoom]) => send("viewport:zoom", pct(zoom))}
			/>
		</>
	);
}
