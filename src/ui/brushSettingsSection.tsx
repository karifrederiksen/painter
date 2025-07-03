import type React from "react";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { pct, useStream, type Brush, type Send, type Stream } from "~/state";
import { formatPct, formatPx } from "./util";

export interface BrushSettingsSectionProps {
	brush$: Stream<Brush>;
	send: Send;
}

export function BrushSettingsSection({
	brush$,
	send,
}: BrushSettingsSectionProps): React.JSX.Element {
	const brush = useStream(brush$);

	return (
		<>
			<div className="flex flex-row justify-between">
				<Label htmlFor="brush-size">Size</Label>
				<div className="text-sm">{formatPx(brush.size)}</div>
			</div>
			<Slider
				id="brush-size"
				min={1}
				max={500}
				step={0.1}
				value={[brush.size]}
				onValueChange={([size]) => send("brush:setSize", size)}
			/>
			<div className="flex flex-row justify-between">
				<Label htmlFor="brush-softness">Softness</Label>
				<div className="text-sm">{formatPct(brush.softness)}</div>
			</div>
			<Slider
				id="brush-softness"
				min={0.01}
				max={1}
				step={0.01}
				value={[brush.softness]}
				onValueChange={([size]) => send("brush:setSoftness", pct(size))}
			/>
			<div className="flex flex-row justify-between">
				<Label htmlFor="brush-flow">Flow</Label>
				<div className="text-sm">{formatPct(brush.flow)}</div>
			</div>
			<Slider
				id="brush-flow"
				min={0.01}
				max={1}
				step={0.01}
				value={[brush.flow]}
				onValueChange={([size]) => send("brush:setFlow", pct(size))}
			/>
			<div className="flex flex-row justify-between">
				<Label htmlFor="brush-spacing">Spacing</Label>
				<div className="text-sm">{formatPct(brush.spacing)}</div>
			</div>
			<Slider
				id="brush-spacing"
				min={0.01}
				max={1}
				step={0.01}
				value={[brush.spacing]}
				onValueChange={([size]) => send("brush:setSpacing", pct(size))}
			/>
		</>
	);
}
