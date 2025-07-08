import { clamp } from "~/util";
import {
	type LayerId,
	type Pct,
	type Image,
	layerId,
	pct,
	type UpdateArgs,
} from "./base";

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

export interface WithLayers {
	readonly layers: FolderLayer;
	readonly currentLayerId: LayerId;
}

export interface DoCreateLayer {
	"layers:createLayer"<S extends WithLayers>(
		args: UpdateArgs<S>,
		name: string,
	): S;
}

export interface DoCreateFolder {
	"layers:createFolder"<S extends WithLayers>(
		args: UpdateArgs<S>,
		name: string,
	): S;
}

export interface DoSelect {
	"layers:select"<S extends WithLayers>(args: UpdateArgs<S>, id: LayerId): S;
}

export interface DoSetOpacity {
	"layers:setOpacity"<S extends WithLayers>(
		args: UpdateArgs<S>,
		opacity: Pct,
	): S;
}

export interface DoToggleHidden {
	"layers:toggleHidden"<S extends WithLayers>(args: UpdateArgs<S>): S;
}

export interface DoDelete {
	"layers:delete"<S extends WithLayers>(args: UpdateArgs<S>): S;
}

export type DoLayerThings = DoCreateLayer &
	DoCreateFolder &
	DoSelect &
	DoSetOpacity &
	DoToggleHidden &
	DoDelete;

export const doCreateLayer: DoCreateLayer = {
	"layers:createLayer"({ state }, name) {
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
		return {
			...state,
			layers: nextLayers,
			currentLayerId: nextLayerId,
		};
	},
};
export const doCreateFolder: DoCreateFolder = {
	"layers:createFolder"({ state }, name) {
		void name;
		void state;
		throw new Error("TODO");
	},
};
export const doSelect: DoSelect = {
	"layers:select"({ state }, layerId) {
		return { ...state, currentLayerId: layerId };
	},
};
export const doSetOpacity: DoSetOpacity = {
	"layers:setOpacity"({ state }, opacity) {
		return updateCurrentLayer(state, (x) => ({
			...x,
			opacity: clamp(opacity, pct(0), pct(1)),
		}));
	},
};
export const doToggleHidden: DoToggleHidden = {
	"layers:toggleHidden"({ state }) {
		return updateCurrentLayer(state, (x) => ({
			...x,
			isHidden: !x.isHidden,
		}));
	},
};
export const doDelete: DoDelete = {
	"layers:delete"({ state }) {
		const [nextLayers, nextLayerId] = removeCurrent(
			state.layers,
			state.currentLayerId,
		);
		return {
			...state,
			layers: nextLayers,
			currentLayerId: nextLayerId,
		};
	},
};

export const doLayerThings: DoLayerThings = {
	...doCreateLayer,
	...doCreateFolder,
	...doSelect,
	...doSetOpacity,
	...doToggleHidden,
	...doDelete,
};

export function initLayers(): WithLayers {
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
	return {
		currentLayerId: currentLayerId,
		layers,
	};
}

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

function updateLayers<S extends WithLayers>(
	state: S,
	update: (folder: FolderLayer) => FolderLayer,
): S {
	return { ...state, layers: update(state.layers) };
}

function updateCurrentLayer<S extends WithLayers>(
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
