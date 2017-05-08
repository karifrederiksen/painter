import { Events, Event } from "../Engine/Global/Events";
import { Settings } from "../Engine/Global/Settings";

import { Layer } from "../Engine/Rendering/Layers/Layer";

import { Iterable, List } from "immutable";



class UILayer {
	public node: HTMLOptionElement;
	public layer: Layer;


	constructor(layer: Layer, selected: boolean) {
		this.layer = layer;
		this.node = document.createElement("option");
		this.node.innerHTML = layer.name;
		this.node.setAttribute("data-name", layer.name);
		if (selected) {
			this.node.setAttribute("selected", "selected");
		}
	}
}

export interface UILayersButtonsCallbacks {
	toggleVisibility: () => void;
	moveUp: () => void;
	moveDown: () => void;
	create: () => void;
	delete: () => void;
}

export class UILayersButtons {
	private toggleVisiblity: HTMLButtonElement;
	private moveUp: HTMLButtonElement;
	private moveDown: HTMLButtonElement;
	private create: HTMLButtonElement;
	private delete: HTMLButtonElement;

	constructor(callbacks: UILayersButtonsCallbacks) {
		this.toggleVisiblity = <HTMLButtonElement>document.getElementById("btn-layer-toggleVisible");
		this.moveUp = <HTMLButtonElement>document.getElementById("btn-layer-moveUp");
		this.moveDown = <HTMLButtonElement>document.getElementById("btn-layer-moveUp");
		this.create = <HTMLButtonElement>document.getElementById("btn-layer-create");
		this.delete = <HTMLButtonElement>document.getElementById("btn-layer-delete");

		this.toggleVisiblity.addEventListener("click", () => callbacks.toggleVisibility());
		this.moveUp.addEventListener("click", () => callbacks.moveUp());
		this.moveDown.addEventListener("click", () => callbacks.moveDown());
		this.create.addEventListener("click", () => callbacks.create());
		this.delete.addEventListener("click", () => callbacks.delete());
	}
}


export class UILayers {
	private select: HTMLSelectElement;
	private layerStack: Iterable<number, Layer>;
	private current: Layer = null;
	private UILayers: Iterable<number, UILayer> = List<UILayer>();

	private buttons: UILayersButtons;

	constructor(list: Iterable<number, Layer>, callbacks: UILayersButtonsCallbacks) {
		this.select = <HTMLSelectElement>document.getElementById("layersSelect");
		this.buttons = new UILayersButtons(callbacks);

		this.layerStack = list;
		this.update();

		this.select.addEventListener("change", (ev: StorageEvent) => this.onValueChange(ev));

		Settings.layers.stack.subscribe(stack => this.onLayerStackChange(stack));
		Settings.layers.current.subscribe(current => this.onCurrentLayerChange(current));
	}


	private onLayerStackChange(stack: Iterable<number, Layer>) {
		this.layerStack = stack;
		console.debug(`Stack size: ${stack.size}`);
		this.update();
	}

	private onCurrentLayerChange(layer: Layer) {
		this.current = layer
		this.update();
	}

	public onValueChange(ev: StorageEvent) {
		const name = this.select.options[this.select.selectedIndex].getAttribute("data-name");

		const layer = this.layerStack.filter((l) => l.name === name).first();
		if (layer) {
			Settings.layers.current.broadcast(layer);
		}
		else {
			console.error(`Layer with name \"${name}\" not found`)
		}
	}


	private update() {
		const select = this.select;
		const children = select.children;
		
		for (let i = 0; i < children.length; i++) {
			select.removeChild(children.item(i));
		}

		const current = this.current;
		const stack = this.layerStack;
		const newList: UILayer[] = [];

		for (let i = 0, ilen = stack.count(); i < ilen; i++) {
			const basic = stack.get(i);
			const uiLayer = new UILayer(basic, basic === current);
			select.appendChild(uiLayer.node);
			newList.push(uiLayer);
		}
		this.UILayers = List(newList);
	}
}