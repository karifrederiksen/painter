import { type Color, Hsluv } from "color";
import { opaque, wrap, Vec2, type Opaque, clamp } from "~/util";
import { StreamSource, type Stream } from "./stream";

export type Pct = Opaque<number, "Percent">;
export const pct = opaque.createConstructor<Pct>();

export type Ms = Opaque<number, "Ms">;
export const ms = opaque.createConstructor<Ms>();

export type Bitmap = Opaque<unknown, "Bitmap">;
export const bitmap = opaque.createConstructor<Bitmap>();

export type BrushId = Opaque<number, "BrushId">;
export const brushId = opaque.createConstructor<BrushId>();

export type LayerId = Opaque<number, "LayerId">;
export const layerId = opaque.createConstructor<LayerId>();

export interface Image {
	readonly width: number;
	readonly height: number;
	readonly data: Bitmap;
}

export interface Brush {
	readonly id: BrushId;
	readonly eraser: boolean;
	readonly pigment: Color;
	readonly size: number;
	readonly softness: Pct;
	readonly flow: Pct;
	readonly spacing: Pct;
	readonly delay: Ms;
}

export interface ViewportTransforms {
	readonly zoom: Pct;
	readonly rotation: Pct;
	readonly offset: Vec2;
}

export interface PaintLayer {
	readonly isFolder: false;
	readonly id: LayerId;
	readonly name: string;
	readonly opacity: Pct;
	readonly isHidden: boolean;
	readonly preview: null | Image;
}

export interface FolderLayer {
	readonly isFolder: true;
	readonly id: LayerId;
	readonly name: string;
	readonly opacity: Pct;
	readonly isClosed: boolean;
	readonly isHidden: boolean;
	readonly layers: readonly Layer[];
}

export type Layer = PaintLayer | FolderLayer;

function getNextLayerId(root: FolderLayer): LayerId {
	function findMax(layer: Layer, max: number): number {
		if (layer.id > max) {
			max = layer.id;
		}
		if (layer.isFolder) {
			for (const subLayer of layer.layers) {
				max = findMax(subLayer, max);
			}
		}
		return max;
	}

	return layerId(findMax(root, -1) + 1);
}

function insertAfterCurrent(
	root: FolderLayer,
	currentLayerId: LayerId,
	newLayer: Layer,
): FolderLayer {
	const f = (folder: FolderLayer): FolderLayer => {
		if (folder.id === currentLayerId) {
			return { ...folder, layers: [...folder.layers, newLayer] };
		}
		for (let idx = 0; idx < folder.layers.length; idx += 1) {
			const subLayer = folder.layers[idx];
			if (subLayer.isFolder) {
				const newSubLayer = f(subLayer);
				if (newSubLayer !== subLayer) {
					const nextLayers = folder.layers.slice();
					nextLayers.splice(idx, 1, newSubLayer);
					return {
						...folder,
						layers: nextLayers,
					};
				}
			} else if (subLayer.id === currentLayerId) {
				const nextLayers = folder.layers.slice();
				nextLayers.splice(idx + 1, 0, newLayer);

				return {
					...folder,
					layers: nextLayers,
				};
			}
		}
		return folder;
	};

	return f(root);
}

function removeCurrent(
	root: FolderLayer,
	currentLayerId: LayerId,
): [FolderLayer, LayerId] {
	if (currentLayerId === 0) return [root, currentLayerId];

	const f = (folder: FolderLayer): null | [FolderLayer, LayerId] => {
		for (let idx = 0; idx < folder.layers.length; idx += 1) {
			const subLayer = folder.layers[idx];
			if (subLayer.id === currentLayerId) {
				const nextLayers = folder.layers.slice();
				nextLayers.splice(idx, 1);

				// todo: select nearest layer. try everything else before selecting root folder
				const nextLayerId = folder.id;
				return [
					{
						...folder,
						layers: nextLayers,
					},
					nextLayerId,
				];
			}

			if (subLayer.isFolder) {
				const result = f(subLayer);
				if (result !== null) {
					const nextLayers = folder.layers.slice();
					nextLayers.splice(idx, 1, result[0]);
					return [
						{
							...folder,
							layers: nextLayers,
						},
						result[1],
					];
				}
			}
		}
		return null;
	};

	return f(root)!;
}

export function getLayerById(
	folder: FolderLayer,
	layerId: LayerId,
): Layer | null {
	if (folder.id === layerId) return folder;

	for (const layer of folder.layers) {
		if (layer.id === layerId) return layer;
		if (!layer.isFolder) continue;

		const foundLayer = getLayerById(layer, layerId);
		if (foundLayer === null) continue;

		return foundLayer;
	}

	return null;
}

export interface UICanvas {
	readonly name: string;
}

export interface UIInitialState {
	readonly renderer: null;
	readonly canvas: UICanvas;
	readonly viewport: ViewportTransforms;
	readonly minimap: null;
	readonly layers: FolderLayer;
	readonly palette: readonly Color[];
	readonly brushes: readonly Brush[];
	readonly currentLayerId: LayerId;
	readonly currentBrushId: BrushId;
}

export interface UICanvasState {
	readonly renderer: RendererState;
	readonly canvas: UICanvas;
	readonly viewport: ViewportTransforms;
	readonly minimap: Image;
	readonly layers: FolderLayer;
	readonly palette: readonly Color[];
	readonly brushes: readonly Brush[];
	readonly currentLayerId: LayerId;
	readonly currentBrushId: BrushId;
}

export type UIState = UIInitialState | UICanvasState;

export interface CreateCanvasArgs {
	readonly name: string;
	readonly width: number;
	readonly height: number;
}

export abstract class BaseStateMachine<Tag extends string> {
	readonly tag: Tag;
	constructor(tag: Tag) {
		this.tag = tag;
	}

	abstract state(): UIState;

	tick(time: Ms): BaseStateMachine<string> {
		void time;
		return this;
	}
	"canvas:create"(size: CreateCanvasArgs): BaseStateMachine<string> {
		void size;
		return this;
	}
	"pointer:down"(): BaseStateMachine<string> {
		return this;
	}
	"pointer:move"(): BaseStateMachine<string> {
		return this;
	}
	"pointer:up"(): BaseStateMachine<string> {
		return this;
	}
	keyboard(ev: KeyboardEvent): BaseStateMachine<string> {
		void ev;
		return this;
	}
	"brush:setSize"(size: number): BaseStateMachine<string> {
		void size;
		return this;
	}
	"brush:setFlow"(flow: Pct): BaseStateMachine<string> {
		void flow;
		return this;
	}
	"brush:setSpacing"(flow: Pct): BaseStateMachine<string> {
		void flow;
		return this;
	}
	"brush:setColor"(color: Hsluv): BaseStateMachine<string> {
		void color;
		return this;
	}
	"brush:setSoftness"(softness: Pct): BaseStateMachine<string> {
		void softness;
		return this;
	}
	"layers:create"(name: string): BaseStateMachine<string> {
		void name;
		return this;
	}
	"layers:createFolder"(name: string): BaseStateMachine<string> {
		void name;
		return this;
	}
	"layers:select"(layerId: LayerId): BaseStateMachine<string> {
		void layerId;
		return this;
	}
	"layers:setOpacity"(opacity: Pct): BaseStateMachine<string> {
		void opacity;
		return this;
	}
	"layers:toggleHidden"(): BaseStateMachine<string> {
		return this;
	}
	"layers:delete"(): BaseStateMachine<string> {
		return this;
	}
	"viewport:translate"(offset: Vec2): BaseStateMachine<string> {
		void offset;
		return this;
	}
	"viewport:rotate"(rotation: Pct): BaseStateMachine<string> {
		void rotation;
		return this;
	}
	"viewport:zoom"(zoom: Pct): BaseStateMachine<string> {
		void zoom;
		return this;
	}
}

function updateLayers<S extends UIState>(
	state: S,
	update: (folder: FolderLayer) => FolderLayer,
): S {
	return { ...state, layers: update(state.layers) };
}

function updateCurrentLayer<S extends UIState>(
	state: S,
	update: (layer: Layer) => Layer,
): S {
	const f = (layer: Layer): Layer => {
		if (layer.id === state.currentLayerId) {
			return update(layer);
		}
		if (layer.isFolder) {
			for (let idx = 0; idx < layer.layers.length; idx += 1) {
				const subLayer = layer.layers[idx];
				const newSubLayer = f(subLayer);
				if (newSubLayer !== subLayer) {
					const nextLayers = layer.layers.slice();
					nextLayers.splice(idx, 1, newSubLayer);
					return {
						...layer,
						layers: nextLayers,
					};
				}
			}
		}
		return layer;
	};
	return updateLayers(state, (folder) => f(folder) as FolderLayer);
}

export function flattenLayers(folder: FolderLayer): PaintLayer[] {
	const results: PaintLayer[] = [];
	flattenLayersHelpers(folder, results);

	return results;
}
function flattenLayersHelpers(
	folder: FolderLayer,
	results: PaintLayer[],
): void {
	for (const layer of folder.layers) {
		if (layer.isFolder) {
			flattenLayersHelpers(layer, results);
		} else {
			results.push(layer);
		}
	}
}

function updateCurrentBrush<S extends UIState>(
	state: S,
	update: (brush: Brush) => Brush,
): S {
	const brush = state.brushes.find((x) => x.id === state.currentBrushId)!;
	const brushIdx = state.brushes.indexOf(brush);
	const brushes = [...state.brushes];
	brushes[brushIdx] = update(brush);
	return { ...state, brushes };
}

export class ConfigureCanvasStateMachine extends BaseStateMachine<
	typeof ConfigureCanvasStateMachine.tag
> {
	static readonly tag = "state:initial";
	readonly uiState: UIInitialState;

	constructor(state: UIInitialState) {
		super(ConfigureCanvasStateMachine.tag);
		this.uiState = state;
	}

	state(): UIState {
		return this.uiState;
	}

	override "canvas:create"(args: CreateCanvasArgs): CanvasStateMachine {
		const state = this.uiState;
		const renderer: RendererState = {
			canvasSize: new Vec2(args.width, args.height),
		};
		const canvas: UICanvas = { name: args.name };
		const minimap: Image = { width: 100, height: 100, data: bitmap(0) };
		return new CanvasStateMachine({ ...state, renderer, canvas, minimap });
	}
}

export class CanvasStateMachine extends BaseStateMachine<
	typeof CanvasStateMachine.tag
> {
	static readonly tag = "state:canvas";
	readonly #state: UICanvasState;

	constructor(state: UICanvasState) {
		super(CanvasStateMachine.tag);
		this.#state = state;
	}

	state(): UIState {
		return this.#state;
	}

	override "brush:setSize"(size: number) {
		const nextState = updateCurrentBrush(this.#state, (brush) => ({
			...brush,
			size: clamp(size, pct(1), pct(500)),
		}));
		return new CanvasStateMachine(nextState);
	}
	override "brush:setSoftness"(softness: Pct) {
		const nextState = updateCurrentBrush(this.#state, (brush) => ({
			...brush,
			softness: clamp(softness, pct(0), pct(1)),
		}));
		return new CanvasStateMachine(nextState);
	}
	override "brush:setFlow"(flow: Pct) {
		const nextState = updateCurrentBrush(this.#state, (brush) => ({
			...brush,
			flow: clamp(flow, pct(0.01), pct(1)),
		}));
		return new CanvasStateMachine(nextState);
	}
	override "brush:setSpacing"(spacing: Pct) {
		const nextState = updateCurrentBrush(this.#state, (brush) => ({
			...brush,
			spacing: clamp(spacing, pct(0.01), pct(1)),
		}));
		return new CanvasStateMachine(nextState);
	}
	override "layers:create"(name: string) {
		const state = this.#state;
		const nextLayerId = getNextLayerId(state.layers);
		const newLayer: PaintLayer = {
			id: nextLayerId,
			isHidden: false,
			isFolder: false,
			name,
			opacity: pct(1.0),
			preview: null,
		};
		const nextLayers = insertAfterCurrent(
			state.layers,
			state.currentLayerId,
			newLayer,
		);

		return new CanvasStateMachine({
			...state,
			layers: nextLayers,
			currentLayerId: nextLayerId,
		});
	}
	override "layers:select"(layerId: LayerId) {
		const state = this.#state;
		return new CanvasStateMachine({ ...state, currentLayerId: layerId });
	}
	override "layers:createFolder"(name: string): BaseStateMachine<string> {
		void name;
		throw new Error("TODO");
	}
	override "layers:setOpacity"(opacity: Pct) {
		const nextState = updateCurrentLayer(this.#state, (x) => ({
			...x,
			opacity: clamp(opacity, pct(0), pct(1)),
		}));
		return new CanvasStateMachine(nextState);
	}
	override "layers:toggleHidden"() {
		const nextState = updateCurrentLayer(this.#state, (x) => ({
			...x,
			isHidden: !x.isHidden,
		}));
		return new CanvasStateMachine(nextState);
	}
	override "layers:delete"(): BaseStateMachine<string> {
		const state = this.#state;
		const [nextLayers, nextLayerId] = removeCurrent(
			state.layers,
			state.currentLayerId,
		);

		return new CanvasStateMachine({
			...state,
			layers: nextLayers,
			currentLayerId: nextLayerId,
		});
	}
	"viewport:translate"(offset: Vec2): BaseStateMachine<string> {
		const state = this.#state;
		return new CanvasStateMachine({
			...state,
			viewport: { ...state.viewport, offset: offset.clampScalar(-1, 1) },
		});
	}
	"viewport:rotate"(rotation: Pct): BaseStateMachine<string> {
		const state = this.#state;
		return new CanvasStateMachine({
			...state,
			viewport: { ...state.viewport, rotation: wrap(rotation, pct(0), pct(1)) },
		});
	}
	"viewport:zoom"(zoom: Pct): BaseStateMachine<string> {
		const state = this.#state;
		return new CanvasStateMachine({
			...state,
			viewport: { ...state.viewport, zoom: clamp(zoom, pct(0.05), pct(3)) },
		});
	}
}

export class StrokingStateMachine extends BaseStateMachine<
	typeof StrokingStateMachine.tag
> {
	static readonly tag = "state:stroke";
	readonly previousStateMachine: StateMachine;
	readonly currentPos: Vec2;

	constructor(previousStateMachine: StateMachine, currentPos: Vec2) {
		super(StrokingStateMachine.tag);
		this.previousStateMachine = previousStateMachine;
		this.currentPos = currentPos;
	}

	state(): UIState {
		return this.previousStateMachine.state();
	}
}

// ui interactions and such. same as what was called ephemeral state before, but should encapsulate all actions, such that all UI components are controlled (except maybe text inputs)
export type StateMachine =
	| ConfigureCanvasStateMachine
	| CanvasStateMachine
	| StrokingStateMachine;

export interface RendererState {
	readonly canvasSize: Vec2;
	// TODO: webgpu state and cached derived state
}

export function createState(): UIInitialState {
	const folderId = layerId(0);
	const currentLayerId = layerId(1);
	const currentLayer: PaintLayer = {
		id: currentLayerId,
		name: "",
		isHidden: false,
		isFolder: false,
		opacity: pct(1),
		preview: null,
	};
	const layers: FolderLayer = {
		id: folderId,
		name: "",
		isHidden: false,
		isClosed: false,
		isFolder: true,
		opacity: pct(1),
		layers: [currentLayer],
	};
	const black = new Hsluv(0, 0, 1);
	const white = new Hsluv(0, 0, 0);
	const currentBrushId = brushId(1);
	const currentBrush: Brush = {
		id: currentBrushId,
		delay: ms(0),
		eraser: false,
		flow: pct(0.05),
		size: 14,
		spacing: pct(0.05),
		softness: pct(0.95),
		pigment: black,
	};

	return {
		brushes: [currentBrush],
		renderer: null,
		canvas: {
			name: "",
		},
		currentLayerId: currentLayerId,
		currentBrushId,
		layers,
		minimap: null,
		palette: [black, white],
		viewport: {
			offset: new Vec2(0, 0),
			rotation: pct(0),
			zoom: pct(1),
		},
	};
}

type Args<T> = T extends (...rest: infer R) => unknown ? R : never;

export interface StateAtom {
	send<MsgTag extends keyof Omit<BaseStateMachine<string>, "tag" | "state">>(
		msgTag: MsgTag,
		...x: Args<BaseStateMachine<string>[MsgTag]>
	): void;
	stream: Stream<StateMachine>;
}
export type Send = StateAtom["send"];

export function createStateAtom(): StateAtom {
	const queue: (readonly any[])[] = [];
	let animationFrameId: number | null = null;
	let handler: StateMachine = new ConfigureCanvasStateMachine(createState());
	const streamSource = new StreamSource<StateMachine>(handler);

	const update = () => {
		let next: undefined | readonly any[] = undefined;
		while ((next = queue.shift())) {
			const [msgTag, ...args] = next;
			if (msgTag !== "tick") {
				console.debug("Msg", msgTag, ...args);
			}

			const handlerFunc = handler[msgTag as keyof BaseStateMachine<string>];
			if (typeof handlerFunc !== "function") {
				console.warn("Invalid message");
				continue;
			}

			try {
				const nextHandler = (handlerFunc as Function).apply(handler, args);
				handler = nextHandler as StateMachine;
			} catch (err) {
				console.error(err);
			}
		}

		animationFrameId = null;

		streamSource.next(handler);
	};

	return {
		send(...args) {
			queue.push(args);
			if (!animationFrameId) {
				animationFrameId = requestAnimationFrame(update);
			}
		},
		stream: streamSource.stream(),
	};
}
