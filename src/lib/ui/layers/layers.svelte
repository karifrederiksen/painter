<script lang="ts">
	import type { State, Sender } from '../../canvas/layers';
	import { Row, DefaultButton, Surface, LabeledSlider, LabeledSwitch } from '../components';
	import { stringToFloat } from '../../util';
	import LayerComponent from './layer.svelte';

	export let layers: State;
	export let sender: Sender;

	$: topLayers = layers.layers.children;
	$: current = layers.current();

	function toFixed2(n: number): string {
		return n.toFixed(2);
	}
</script>

<div class="layersWrapper">
	<Surface>
		<div class="layersControlsWrapper">
			<Row spacing={0.25}>
				<DefaultButton onClick={() => sender.newLayer(current.id)} title="New layer">
					New
				</DefaultButton>
				<DefaultButton onClick={() => sender.removeLayer(current.id)} title="Delete layer">
					Delete
				</DefaultButton>
			</Row>
			<LabeledSwitch
				label="Hidden"
				checked={current.isHidden}
				onCheck={(isHidden) => sender.setHidden(current.id, isHidden)}
			/>
			<LabeledSlider
				label="Opacity"
				value={current.opacity}
				toString={toFixed2}
				fromString={stringToFloat}
				percentage={current.opacity}
				onChange={(pct) => sender.setOpacity(current.id, pct)}
			/>
		</div>
	</Surface>
	<div class="layersListWrapper">
		{#each topLayers as layer}
			<LayerComponent {layer} selectedId={current.id} onClick={(id) => sender.selectLayer(id)} />
		{/each}
	</div>
</div>

<style lang="scss">
	@import '../theme.scss';

	.layersWrapper {
		height: 100%;
	}

	.layersListWrapper {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 0.25rem;
	}

	.layersControlsWrapper {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		padding-top: 0.5rem;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		width: 100%;
	}
</style>
