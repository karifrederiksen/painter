import {
	ConfigureCanvasStateMachine,
	createStateAtom,
	getLayerById,
	StreamSource,
	type Send,
	type StateMachine,
	type Stream,
	// createTicker,
} from "./state";
import { useEffect, useReducer, useRef, useState } from "react";
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
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";

function App() {
	const stateAtom = useRef(createStateAtom()).current;

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

	const { msg$, send } = createMessageSource(stateAtom.send);

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
			{import.meta.env.DEV && (
				<DebugView msg$={msg$} state$={stateAtom.stream} />
			)}
		</div>
	);
}

interface MessageThing {
	readonly msg: readonly [string, ...(readonly unknown[])];
	readonly resultingState: StateMachine;
	readonly timestamp: Date;
}

interface DebugViewProps {
	state$: Stream<StateMachine>;
	msg$: Stream<readonly [string, ...(readonly unknown[])]>;
}

function DebugView({ state$, msg$ }: DebugViewProps) {
	const stateRef = useRef<MessageThing[]>([
		{
			msg: msg$.getValue(),
			resultingState: state$.getValue(),
			timestamp: new Date(),
		},
	]);
	const containerRef = useRef<HTMLDivElement>(null);
	const forceUpdate = useReducer((n) => n + 1, 1)[1];
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const { unsubscribe } = msg$.subscribe((msg) => {
			if (stateRef.current.length > 10_000) return;

			stateRef.current.push({
				msg,
				resultingState: state$.getValue(),
				timestamp: new Date(),
			});
			forceUpdate();
		});
		return unsubscribe;
	}, [msg$, state$]);

	useEffect(() => {
		if (!isOpen || !containerRef.current) return;

		const c = containerRef.current;
		c.scrollTop = c.scrollHeight;
	}, [stateRef.current.length, isOpen]);

	return (
		<Panel
			className={cn(
				"fixed left-2 bottom-2 max-h-[340px] z-50 transition-all duration-200 ease-in-out",
				isOpen && "w-[300px]",
			)}
		>
			<Button variant="outline" onClick={() => setIsOpen((x) => !x)}>
				{`${isOpen ? "Hide" : "State changes"} (${stateRef.current.length})`}
			</Button>
			{isOpen && (
				<div
					className="flex flex-col gap-2 overflow-y-scroll overflow-x-hidden text-ellipsis text-nowrap"
					ref={containerRef}
				>
					{stateRef.current.map(
						({ msg: [msgTag, ...args], resultingState }, idx) => {
							const argsStr = args.map((x) => JSON.stringify(x)).join(" ");
							return (
								<div
									key={idx}
									className="flex flex-row gap-4 items-baseline cursor-pointer"
									onClick={() => {
										console.info(msgTag, ...args);
										console.info(resultingState);
										(window as any).soypaint_debug = {
											msgTag,
											args,
											resultingState,
										};
										console.info(
											"Assigned args and state to window.soypaint_debug",
										);
									}}
								>
									<div className="text-sm font-mono">{msgTag}</div>
									<div
										className="text-xs font-mono text-gray-600"
										title={argsStr}
									>
										{argsStr}
									</div>
								</div>
							);
						},
					)}
				</div>
			)}
		</Panel>
	);
}

function createMessageSource(send: Send): {
	msg$: Stream<readonly [string, ...(readonly unknown[])]>;
	send: Send;
} {
	const msgSource = new StreamSource<
		readonly [string, ...(readonly unknown[])]
	>(["initialize"]);
	if (!import.meta.env.DEV) {
		return {
			send,
			msg$: msgSource.stream(),
		};
	}

	const wrappedSend: Send = (...args) => {
		setTimeout(() => msgSource.next(args), 0);
		return send(...args);
	};

	return {
		msg$: msgSource.stream(),
		send: wrappedSend,
	};
}

export default App;
