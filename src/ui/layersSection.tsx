import {
	EyeIcon,
	EyeOffIcon,
	FolderPlusIcon,
	SquareMinusIcon,
	SquarePlusIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
	pct,
	useStream,
	type FolderLayer,
	type Layer,
	type LayerId,
	type Send,
	type Stream,
} from "~/state";
import { formatPct } from "./util";
import type React from "react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Slider } from "~/components/ui/slider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";

interface LayerCardProps {
	layer: Layer;
	currentLayerId: LayerId;
	send: Send;
}

function LayerCard({ layer, currentLayerId, send }: LayerCardProps) {
	if (!layer.isFolder) {
		return (
			<div
				className={cn(
					"flex flex-row gap-2 border-secondary border-1 pb-1 cursor-pointer",
					layer.id === currentLayerId && "outline-2 outline-primary",
				)}
				onClick={() => send("layers:select", layer.id)}
			>
				<div className="aspect-square bg-gray-500" />
				<div className="flex flex-col gap-1">
					<div className="">{layer.name || `Layer ${layer.id}`}</div>
					<div className="flex flex-row items-center gap-2">
						{layer.isHidden ? (
							<>
								<EyeOffIcon className="size-4" />
								<div className="text-xs">Hidden</div>
							</>
						) : (
							<>
								<EyeIcon className="size-4" />
								<div className="text-xs">{formatPct(layer.opacity)}</div>
							</>
						)}
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="w-full">
			{/* TODO: make folder visible */}
			{layer.layers.map((subLayer) => (
				<LayerCard
					key={subLayer.id}
					layer={subLayer}
					currentLayerId={currentLayerId}
					send={send}
				/>
			))}
		</div>
	);
}

export interface LayersSectionProps {
	layers$: Stream<FolderLayer>;
	currentLayer$: Stream<Layer>;
	send: Send;
}

export function LayersSection({
	layers$,
	currentLayer$,
	send,
}: LayersSectionProps): React.JSX.Element {
	const layers = useStream(layers$);
	const currentLayer = useStream(currentLayer$);
	return (
		<>
			<div className="flex flex-row justify-between">
				<Label htmlFor="layer-visible">Visible</Label>
				<Switch
					id="layer-visible"
					checked={!currentLayer.isHidden}
					onCheckedChange={() => send("layers:toggleHidden")}
				/>
			</div>
			<div className="flex flex-row justify-between">
				<Label htmlFor="layer-opacity">Opacity</Label>
				<div className="text-sm">{formatPct(currentLayer.opacity)}</div>
			</div>
			<Slider
				id="layer-opacity"
				min={0}
				max={1}
				step={0.01}
				value={[currentLayer.opacity]}
				onValueChange={([opacity]) => send("layers:setOpacity", pct(opacity))}
			/>
			<div className="flex flex-col gap-2">
				<div className="flex flex-col gap-1">
					{layers.layers.map((layer) => (
						<LayerCard
							key={layer.id}
							layer={layer}
							currentLayerId={currentLayer.id}
							send={send}
						/>
					))}
				</div>
				<div className="flex flex-row gap-2 w-full justify-around mt-3">
					<Tooltip>
						<TooltipContent>Create layer</TooltipContent>
						<TooltipTrigger asChild>
							<Button
								variant="secondary"
								role="button"
								onClick={() => send("layers:create", "")}
							>
								<SquarePlusIcon />
							</Button>
						</TooltipTrigger>
					</Tooltip>
					<Tooltip>
						<TooltipContent>Create group</TooltipContent>
						<TooltipTrigger asChild>
							<Button
								variant="secondary"
								role="button"
								onClick={() => send("layers:createFolder", "")}
							>
								<FolderPlusIcon />
							</Button>
						</TooltipTrigger>
					</Tooltip>
					<Tooltip>
						<TooltipContent>Delete layer/group</TooltipContent>
						<TooltipTrigger asChild>
							<Button
								variant="destructive"
								role="button"
								onClick={() => send("layers:delete")}
							>
								<SquareMinusIcon />
							</Button>
						</TooltipTrigger>
					</Tooltip>
				</div>
			</div>
		</>
	);
}
