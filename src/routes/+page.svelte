<script lang="ts">
	import { onMount } from 'svelte';
	import * as Toolbar from '../lib/ui/toolbar';
	import type * as Camera from '../lib/tools/camera';
	import * as Theme from '../lib/ui/theme';
	import { Layers } from '../lib/ui/layers';
	import * as Input from '../lib/canvas/input';
	import * as Keymapping from '../lib/canvas/keymapping';
	import * as Canvas from '../lib/canvas';
	import * as Setup from '../lib/ui/setup';
	import { SetOnce, FrameStream, Store, Vec2, type PushOnlyArray } from '../lib/util';
	import { Surface } from '../lib/ui/components';
	import { samples } from '../lib/ui/debugging';
	import { MiniMap } from '../lib/ui/mini-map';
	import { Subscription as RxSubscription } from 'rxjs';

	function getCanvasOffset(canvas: HTMLCanvasElement): Vec2 {
		return new Vec2(canvas.offsetLeft, canvas.offsetTop);
	}

	function getCanvasInfo({
		canvasOffset,
		canvasResolution
	}: {
		readonly canvasOffset: Vec2;
		readonly canvasResolution: Vec2;
	}): Canvas.CanvasInfo {
		return {
			resolution: canvasResolution,
			halfResoution: canvasResolution.multiplyScalar(0.5),
			offset: canvasOffset
		};
	}

	// function useUnloadPromptEffect(c: Component) {
	//     function handle(e: BeforeUnloadEvent) {
	//         e.preventDefault()
	//         e.returnValue = ""
	//     }
	//     window.addEventListener("beforeunload", handle)
	//     useUnmount(c, () => {
	//         window.removeEventListener("beforeunload", handle)
	//     })
	// }

	function createUpdateThemeEffect() {
		let prevTheme: Theme.Theme | null = null;
		return (nextTheme: Theme.Theme) => {
			if (prevTheme === null) {
				Theme.updateAll(nextTheme);
			} else {
				Theme.updateDiff(prevTheme, nextTheme);
			}
			prevTheme = nextTheme;
		};
	}

	const [initialState, initialEphemeral] = Canvas.initState();
	const canvasResolution = new Vec2(800, 800);

	let canvasRef: HTMLCanvasElement | null = null;
	let store_: Store.Store<Canvas.Config, Canvas.State, Canvas.CanvasMsg> | undefined;
	let state: Canvas.Config | undefined;
	let sender: Canvas.Sender | undefined;
	let canvasInfo: Canvas.CanvasInfo = getCanvasInfo({
		canvasOffset: new Vec2(initialState.tool.camera.offsetX, initialState.tool.camera.offsetY),
		canvasResolution
	});

	interface Disposals extends PushOnlyArray<(() => void) | RxSubscription> {}

	onMount(() => {
		if (canvasRef == null) {
			throw new Error('Canvas not found');
		}
		const debuggingGl = new SetOnce<WebGLRenderingContext>();
		const canvas = Canvas.Canvas.create(canvasRef, {
			onStats: (stats) => {
				samples.update((c) => c.update(stats));
			},
			onWebglContextCreated: (gl) => {
				console.log('debuggingGl set');
				debuggingGl.set(gl);
			}
		});
		if (canvas === null) {
			throw new Error('Failed to initialize Canvas');
		}

		const store = Store.create<Canvas.Config, Canvas.State, Canvas.CanvasMsg, Canvas.Effect>({
			initialState,
			initialEphemeral,
			effectsHandler: (ef) => canvas.handle(ef),
			forceRender: () => {},
			update: (state, ephState, msg) => Canvas.update(canvasInfo, state, ephState, msg)
		});
		store_ = store;
		state = store.getState();
		sender = new Canvas.Sender(store.send);
		const updateTheme = createUpdateThemeEffect();

		updateTheme(state.theme);
		console.log('Painter mounting...');
		const disposals: Disposals = [];
		console.log('Painter mounted');

		canvasInfo = getCanvasInfo({
			canvasOffset: getCanvasOffset(canvasRef),
			canvasResolution
		});

		const canvasObs = Input.listen(canvasRef);
		disposals.push(canvasObs.click.subscribe(sender.onClick));
		disposals.push(canvasObs.release.subscribe(sender.onRelease));
		disposals.push(canvasObs.move.subscribe(() => {}));
		disposals.push(canvasObs.drag.subscribe(sender.onDrag));
		disposals.push(
			Keymapping.listen({
				handle: sender.onKeyboard
			})
		);
		disposals.push(FrameStream.FrameStream.make(sender.onFrame));
		disposals.push(() => canvas.dispose());

		if (process.env.NODE_ENV !== 'production') {
			Setup.setup(canvasRef, () => store.getState(), sender).then(() => {
				console.log('setup complete');
			});
		}
		return () => {
			for (const d of disposals) {
				if (d instanceof RxSubscription) {
					d.unsubscribe();
				} else {
					d();
				}
			}
			console.log('Painter unmounted');
		};
	});

	{
		const onResize = () => {
			if (!canvasRef) return;
			canvasInfo = getCanvasInfo({
				canvasOffset: getCanvasOffset(canvasRef),
				canvasResolution
			});
		};
		onMount(() => {
			window.addEventListener('resize', onResize);
			return () => {
				window.removeEventListener('resize', onResize);
			};
		});
	}

	function getCanvasTransform(cam: Camera.Config): string {
		const translate = 'translate(' + cam.offsetX + 'px, ' + cam.offsetY + 'px) ';
		const rotate = 'rotate(' + cam.rotateTurns + 'turn) ';
		const scale = 'scale(' + cam.zoomPct + ', ' + cam.zoomPct + ')';
		return translate + rotate + scale;
	}

	// if (process.env.NODE_ENV !== "development") {
	//     useUnloadPromptEffect()
	// }

	// return (): Op => {
	//     const state = store.getState()
	//     setupCanvas()
	//     updateTheme(state.theme)
	// }
</script>

<div class="appContainer">
	<div class="wrapper">
		{#if sender && state}
			<Toolbar.Toolbar
				sender={sender.tool}
				tool={state.tool}
				transientState={{ isDetailsExpanded: true }}
			/>
		{/if}
		<canvas
			class="canvas"
			bind:this={canvasRef}
			width={canvasInfo?.resolution.x ?? 800}
			height={canvasInfo?.resolution.y ?? 800}
			style={!state ? undefined : `transform: ${getCanvasTransform(state.tool.camera)}`}
		/>
		{#if sender && state}
			<div class="layersViewContainer">
				<Surface>
					<MiniMap camera={state.tool.camera} sender={sender.tool.camera} />
					<Layers layers={state.layers} sender={sender.layer} />
				</Surface>
			</div>
		{/if}
	</div>
	<!-- <div class="bottomLeft">
		<PrimaryButton onClick={sender.randomizeTheme}>Next theme</PrimaryButton>
	</div>
	{#if process.env.NODE_ENV === 'development'}
		<div class="bottomRight">
			<Debugging gl={debuggingGl} themeRng={store.getEphemeral().themeRng} />
		</div>
	{/if} -->
</div>

<style lang="scss">
	@import '../lib/ui/theme.scss';

	.wrapper {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
		box-sizing: border-box !important;

		** {
			margin: 0;
			padding: 0;
			border: 0;
			outline: none;
			box-sizing: inherit;
		}
	}

	.bottomLeft {
		position: absolute;
		left: 0.5rem;
		bottom: 0.5rem;
	}

	.bottomRight {
		position: absolute;
		right: 0.5rem;
		bottom: 0.5rem;
	}

	.appContainer {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		font-family: $fonts-normal;
	}

	.layersViewContainer {
		width: 14rem;
		z-index: 1;
	}

	.canvas {
		cursor: crosshair;
		z-index: 0;
	}
</style>
