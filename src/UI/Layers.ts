import { Events, Event } from "../Engine/Global/Events";
import { Settings, Setting } from "../Engine/Global/Settings";

import { LayerBasic } from "../Engine/Rendering/Layers/Layer";

import { Iterable, List } from "immutable";



class UILayer {
	public node: HTMLOptionElement;
	public layer: LayerBasic;


	constructor(layer: LayerBasic, selected: boolean) {
		this.layer = layer;
		this.node = document.createElement("option");
		this.node.innerHTML = layer.name;
		this.node.setAttribute("data-name", layer.name);
		if (selected) {
			this.node.setAttribute("selected", "selected");
		}
	}
}


export class UILayers {
	private parentElement: HTMLSpanElement;
	private select: HTMLSelectElement;
	private layerStack: Iterable<number, LayerBasic>;
	private current: LayerBasic = null;
	private UILayers: Iterable<number, UILayer> = List<UILayer>();

	constructor(list: Iterable<number, LayerBasic>) {
		this.parentElement = <HTMLSpanElement>document.getElementById("layerArea");
		this.select = <HTMLSelectElement>document.getElementById("layersSelect");

		this.layerStack = list;
		this.update();

		Settings.layers.stack.subscribe(this.onLayerStackChange);
		Settings.layers.current.subscribe(this.onCurrentLayerChange);

	}


	private onLayerStackChange = (stack: Iterable<number, LayerBasic>) => {
		this.layerStack = stack;
		console.debug(`stack size: ${stack.size}`);
		this.update();

	}

	private onCurrentLayerChange = (layer: LayerBasic) => {
		this.current = layer
		this.update();
	}

	public onValueChange = (ev: StorageEvent) => {
		const name = this.select.options[this.select.selectedIndex].getAttribute("data-name");

		const layer = this.layerStack.filter((l) => l.name === name).first();
		if (layer) {
			Settings.layers.current.broadcast(layer);
		}
		else {
			console.error(`Layer with name \'${name}\' not found`)
		}
	}


	private update() {
		const parent = this.parentElement;
		const children = parent.children;
		
		for (let i = 0; i < children.length; i++) {
			parent.removeChild(children.item(i));
		}

		const select = <HTMLSelectElement>document.createElement("select");
		this.select = select;
		parent.appendChild(select);

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

		this.select.addEventListener("change", this.onValueChange);
	}
}