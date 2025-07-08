import {
	createStateAtom,
	isBuildingCanvas,
	isCanvas,
	StreamSource,
	WhenStream,
	type DoAny,
	type Send,
	type State,
	type Stream,
} from "./state";
import { getLayerById } from "./state/layers";
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

	const brush$ = stateAtom.stream.map(
		({ brushes, currentBrushId }) =>
			brushes.find((b) => b.id === currentBrushId)!,
	);
	const color$ = brush$.map((x) => x.pigment);

	// TODO: get rid of this or add it to the state
	const colorMode$ = new StreamSource<ColorMode>(ColorMode.Hsluv).stream();

	const { msg$, send } = createMessageSource(stateAtom.send);

	return (
		<div className="relative w-screen h-screen flex justify-center items-center flex-col gap-4 overflow-hidden">
			<Panel className="fixed left-2 top-2 z-10">
				<ColorWheel color$={color$} colorMode$={colorMode$} send={send} />
				<BrushSettingsSection brush$={brush$} send={send} />
			</Panel>
			<WhenStream
				stream={stateAtom.stream}
				cond={isBuildingCanvas}
				render={(st) => (
					<CanvasBuilder
						className="z-20"
						canvasBuilderStream={st.map(({ canvasBuilder }) => canvasBuilder)}
						send={send}
					/>
				)}
			/>
			<WhenStream
				stream={stateAtom.stream}
				cond={isCanvas}
				render={(st) => {
					const viewport$ = st.map(({ viewport }) => viewport);
					const layers$ = st.map(({ layers }) => layers);
					const currentLayer$ = st.map(
						({ layers, currentLayerId }) =>
							getLayerById(layers, currentLayerId)!,
					);

					const renderer$ = st.map(({ renderer }) => renderer);
					return (
						<>
							<Panel className="fixed right-2 top-2 z-10">
								<MinimapSection viewport$={viewport$} send={send} />
								<Separator className="my-2" />
								<LayersSection
									currentLayer$={currentLayer$}
									layers$={layers$}
									send={send}
								/>
							</Panel>
							<CanvasPlaceholder
								transformsStream={viewport$}
								rendererStream={renderer$}
								send={send}
							/>
						</>
					);
				}}
			/>
			{import.meta.env.DEV && (
				<DebugView msg$={msg$} state$={stateAtom.stream} />
			)}
		</div>
	);
}

interface MessageThing {
	readonly msg: readonly [string, ...(readonly unknown[])];
	readonly resultingState: State;
	readonly timestamp: Date;
}

interface DebugViewProps {
	state$: Stream<State>;
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

function createMessageSource(send: Send<DoAny>): {
	msg$: Stream<readonly [string, ...(readonly unknown[])]>;
	send: Send<DoAny>;
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

	const wrappedSend: Send<DoAny> = (key, ...args) => {
		setTimeout(() => msgSource.next([key, ...args]), 0);
		send(key, ...args);
	};

	return {
		msg$: msgSource.stream(),
		send: wrappedSend,
	};
}

export default App;
