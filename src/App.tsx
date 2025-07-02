import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { Skeleton } from "~/components/ui/skeleton";
import { Label } from "./components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Input } from "./components/ui/input";
import { Separator } from "./components/ui/separator";
import {
	EyeIcon,
	EyeOffIcon,
	FolderPlusIcon,
	SquareMinusIcon,
	SquarePlusIcon,
} from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "./components/ui/tooltip";
import {
	ConfigureCanvasStateMachine,
	createPct,
	createStateAtom,
	getLayerById,
	// createTicker,
	useStream,
	type Brush,
	type FolderLayer,
	type Layer,
	type LayerId,
	type Pct,
	type RendererState,
	type Send,
	type Stream,
	type UICanvas,
	type ViewportTransforms,
} from "./state";
import { /*useEffect,*/ useEffect, useMemo, useRef, type JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./components/ui/form";
import { devInitialize } from "./devInitialize";
import { Vec2 } from "./util";

function App() {
	const stateAtom = useMemo(createStateAtom, []);

	if (import.meta.env.DEV) {
		devInitialize(stateAtom);
	}

	// useEffect(() => {
	// 	const ticker = createTicker(stateAtom);
	// 	ticker.start();
	// 	return () => {
	// 		ticker.stop();
	// 	};
	// }, [stateAtom]);

	const state = stateAtom.stream.map((x) => x.state());
	const brushStream = state.map(
		({ brushes, currentBrushId }) =>
			brushes.find((b) => b.id === currentBrushId)!,
	);
	const layersStream = state.map(({ layers }) => layers);
	const currentLayerStream = state.map(
		({ layers, currentLayerId }) => getLayerById(layers, currentLayerId)!,
	);
	const canvasBuilderStream = stateAtom.stream.map((x) => {
		if (x.tag === ConfigureCanvasStateMachine.tag) {
			return x.uiState.canvas;
		}
		return null;
	});
	const transformsStream = state.map(({ viewport }) => viewport);
	const rendererStream = stateAtom.stream.map((x) => {
		if (x.tag === ConfigureCanvasStateMachine.tag) return null;

		return x.state().renderer;
	});
	return (
		<div className="relative w-screen h-screen flex justify-center items-center flex-col gap-4 overflow-hidden">
			<ToolMenu
				brushStream={brushStream}
				send={stateAtom.send}
				className="z-10"
			/>
			<LayerContent
				className="z-10"
				layersStream={layersStream}
				currentLayerStream={currentLayerStream}
				viewportStream={transformsStream}
				send={stateAtom.send}
			/>
			<CanvasBuilder
				className="z-20"
				canvasBuilderStream={canvasBuilderStream}
				send={stateAtom.send}
			/>
			<PlaceholderCanvas
				transformsStream={transformsStream}
				rendererStream={rendererStream}
			/>
		</div>
	);
}

interface ToolMenuProps {
	className?: string;
	brushStream: Stream<Brush>;
	send: Send;
}

function ToolMenu({ className, brushStream, send }: ToolMenuProps) {
	const brush = useStream(brushStream);
	return (
		<Card
			className={cn(
				"fixed left-2 top-2 min-w-[200px] flex flex-col gap-4 py-4 px-2",
				className,
			)}
		>
			<Skeleton className="w-full aspect-square" />

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
				onValueChange={([size]) => send("brush:setSoftness", createPct(size))}
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
				onValueChange={([size]) => send("brush:setFlow", createPct(size))}
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
				onValueChange={([size]) => send("brush:setSpacing", createPct(size))}
			/>
		</Card>
	);
}

interface MinimapProps {
	send: Send;
}

function Minimap({ send }: MinimapProps): JSX.Element {
	const skeletonRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		function handleTouchMove(ev: PointerEvent) {
			if (
				!(ev.target instanceof HTMLElement && ev.target === skeletonRef.current)
			)
				return;

			const down = ev.pressure > 0;
			if (!down) return;

			const tarect = ev.target.getBoundingClientRect();
			const evPt = new Vec2(ev.x, ev.y);
			const targetPt = new Vec2(tarect.x, tarect.y);
			const targetSize = new Vec2(tarect.width, tarect.height);
			const localPt = evPt.subtract(targetPt);
			const pct = localPt.divide(targetSize);

			const viewSpace = pct.multiplyScalar(2).subtractScalar(1);

			send("viewport:translate", viewSpace);
		}

		window.addEventListener("pointermove", handleTouchMove);
		return () => {
			window.removeEventListener("pointermove", handleTouchMove);
		};
	}, []);

	return (
		<Skeleton
			ref={skeletonRef}
			className="w-full aspect-square"
			onTouchMove={(ev) => {
				console.log(ev);
			}}
		/>
	);
}

interface LayerContentProps {
	className?: string;
	viewportStream: Stream<ViewportTransforms>;
	layersStream: Stream<FolderLayer>;
	currentLayerStream: Stream<Layer>;
	send: Send;
}
function LayerContent({
	send,
	className,
	viewportStream,
	layersStream,
	currentLayerStream,
}: LayerContentProps) {
	const layers = useStream(layersStream);
	const currentLayer = useStream(currentLayerStream);
	const viewPortTransforms = useStream(viewportStream);
	return (
		<Card
			className={cn(
				"fixed right-2 top-2 min-w-[200px] flex flex-col gap-4 py-4 px-2",
				className,
			)}
		>
			<Minimap send={send} />

			<div className="flex flex-row justify-between">
				<Label htmlFor="viewport-rotate">Rotation</Label>
				<div className="text-sm">{formatPct(viewPortTransforms.rotation)}</div>
			</div>
			<Slider
				id="viewport-rotate"
				min={0}
				max={1}
				step={0.01}
				value={[viewPortTransforms.rotation]}
				onValueChange={([rotation]) =>
					send("viewport:rotate", createPct(rotation))
				}
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
				onValueChange={([zoom]) => send("viewport:zoom", createPct(zoom))}
			/>

			<Separator />

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
				onValueChange={([opacity]) =>
					send("layers:setOpacity", createPct(opacity))
				}
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
		</Card>
	);
}

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
				<Skeleton className="aspect-square" />
				<div className="flex flex-col gap-1">
					<div className="">{layer.name || `Layer ${layer.id}`}</div>
					<div className="flex flex-row items-center gap-2">
						{layer.isHidden ? (
							<EyeOffIcon className="size-4" />
						) : (
							<EyeIcon className="size-4" />
						)}

						<div className="text-xs">{formatPct(layer.opacity)}</div>
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

function canvasSizeCheck(s: string): boolean {
	const n = Number(s);
	if (Number.isNaN(n)) return false;

	return n > 64 && n < 10_000;
}

function canvasSizeFailure(dimension: string) {
	return `Canvas ${dimension} must be between 64 and 10,000 pixels`;
}

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	width: z.string().refine(canvasSizeCheck, {
		message: canvasSizeFailure("width"),
	}),
	height: z.string().refine(canvasSizeCheck, {
		message: canvasSizeFailure("height"),
	}),
});

interface CanvasBuilderProps {
	className?: string;
	canvasBuilderStream: Stream<null | UICanvas>;
	send: Send;
}

function CanvasBuilder({
	className,
	canvasBuilderStream,
	send,
}: CanvasBuilderProps): JSX.Element {
	const canvasBuilder = useStream(canvasBuilderStream);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "Painting",
			width: "800",
			height: "800",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		send("canvas:create", {
			name: data.name,
			width: Number(data.width),
			height: Number(data.height),
		});
	}

	if (canvasBuilder === null) return <></>;
	return (
		<div
			className={cn(
				"absolute left-0 right-0 top-0 bottom-0 pointer-none flex items-center justify-center",
				className,
			)}
		>
			<div className="-z-10 absolute left-0 right-0 top-0 bottom-0 bg-accent opacity-85"></div>
			<Card className="p-4">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="w-2/3 space-y-6"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Mona Lisa" {...field} />
									</FormControl>
									<FormDescription>
										This is the name of the canvas in your library and the name
										of the file when downloaded.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="width"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Width</FormLabel>
									<FormControl>
										<Input placeholder="2400" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="height"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Height</FormLabel>
									<FormControl>
										<Input placeholder="3000" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Create</Button>
					</form>
					<div className=""></div>
				</Form>
			</Card>
		</div>
	);
}

interface PlaceholderCanvasProps {
	transformsStream: Stream<ViewportTransforms>;
	rendererStream: Stream<RendererState | null>;
}

function PlaceholderCanvas({
	transformsStream,
	rendererStream,
}: PlaceholderCanvasProps) {
	const { offset, rotation, zoom } = useStream(transformsStream);
	const renderer = useStream(rendererStream);

	if (renderer === null) return <></>;

	const { canvasSize } = renderer;
	return (
		<div className="aboslute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
			<Skeleton
				className=""
				style={{
					width: canvasSize.x,
					height: canvasSize.y,
					transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom * 100}%) rotate(${(rotation * 360).toFixed(2)}deg)`,
				}}
			/>
		</div>
	);
}

function formatPx(pct: number): string {
	const n = pct.toFixed(1);
	return `${n}px`;
}

function formatPct(pct: Pct): string {
	const n = (pct * 100).toFixed(0);
	return `${n}%`;
}

export default App;
