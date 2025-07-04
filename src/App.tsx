import {
	ConfigureCanvasStateMachine,
	createStateAtom,
	getLayerById,
	StreamSource,
	// createTicker,
} from "./state";
import { useMemo } from "react";
import { devInitialize } from "./devInitialize";
import { Panel } from "./ui/panel";
import { BrushSettingsSection } from "./ui/brushSettingsSection";
import { CanvasPlaceholder } from "./ui/canvasPlaceholder";
import { CanvasBuilder } from "./ui/canvasBuilder";
import { LayersSection } from "./ui/layersSection";
import { MinimapSection } from "./ui/minimapSection";
import { Separator } from "./components/ui/separator";
import { ColorWheel } from "./ui/colorWheel";
import { ColorMode } from "./util";

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
	const brush$ = state.map(
		({ brushes, currentBrushId }) =>
			brushes.find((b) => b.id === currentBrushId)!,
	);
	const layers$ = state.map(({ layers }) => layers);
	const currentLayer$ = state.map(
		({ layers, currentLayerId }) => getLayerById(layers, currentLayerId)!,
	);
	const canvasBuilder$ = stateAtom.stream.map((x) => {
		if (x.tag === ConfigureCanvasStateMachine.tag) {
			return x.uiState.canvas;
		}
		return null;
	});
	const viewport$ = state.map(({ viewport }) => viewport);
	const renderer$ = stateAtom.stream.map((x) => {
		if (x.tag === ConfigureCanvasStateMachine.tag) {
			return null;
		}
		return x.state().renderer;
	});
	const color$ = brush$.map((x) => x.pigment);
	const colorMode$ = new StreamSource<ColorMode>(ColorMode.Hsluv).stream();

	const send = stateAtom.send;

	return (
		<div className="relative w-screen h-screen flex justify-center items-center flex-col gap-4 overflow-hidden">
			<Panel className="fixed left-2 top-2 z-10">
				<ColorWheel color$={color$} colorMode$={colorMode$} send={send} />
				<BrushSettingsSection brush$={brush$} send={send} />
			</Panel>
			<Panel className="fixed right-2 top-2 z-10">
				<MinimapSection viewport$={viewport$} send={send} />
				<Separator className="my-2" />
				<LayersSection
					currentLayer$={currentLayer$}
					layers$={layers$}
					send={send}
				/>
			</Panel>
			<CanvasBuilder
				className="z-20"
				canvasBuilderStream={canvasBuilder$}
				send={send}
			/>
			<CanvasPlaceholder
				transformsStream={viewport$}
				rendererStream={renderer$}
				send={send}
			/>
		</div>
	);
}

export default App;
