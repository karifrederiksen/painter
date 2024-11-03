<script>import { Surface, Labeled, Slider, Switch } from "../components/index.js";
import { stringToFloat } from "../../util/index.js";
import InlineLabeled from "../components/labeled/inline-labeled.svelte";
export let sender;
export let brush;
const sendFloat = (ev, f) => {
  const val = stringToFloat(ev.detail);
  if (val != null) {
    f(val);
  }
};
</script>

<Surface>
    <div class="detailsContainer">
        <Labeled
            label="Size"
            valuePostfix=" px"
            value={brush.diameterPx.toFixed(1)}
            on:change={(ev) => sendFloat(ev, sender.setDiameter)}
        >
            <Slider
                value={brush.diameterPx / 500}
                on:change={(ev) => sender.setDiameter(ev.detail * 500)}
            />
        </Labeled>
        <Labeled
            label="Softness"
            value={brush.softness.toFixed(2)}
            on:change={(ev) => sendFloat(ev, sender.setSoftness)}
        >
            <Slider value={brush.softness} on:change={(ev) => sender.setSoftness(ev.detail)} />
        </Labeled>
        <Labeled
            label="Flow"
            value={brush.flowPct.toFixed(2)}
            on:change={(ev) => sendFloat(ev, sender.setOpacity)}
        >
            <Slider value={brush.flowPct} on:change={(ev) => sender.setOpacity(ev.detail)} />
        </Labeled>
        <Labeled
            label="Spacing"
            valuePostfix="%"
            value={brush.spacingPct.toFixed(2)}
            on:change={(ev) => sendFloat(ev, sender.setSpacing)}
        >
            <Slider value={brush.spacingPct} on:change={(ev) => sender.setSpacing(ev.detail)} />
        </Labeled>
        <InlineLabeled label="Pressure-Opacity">
            <Switch
                checked={brush.pressureAffectsOpacity}
                on:change={(ev) => sender.setPressureAffectsOpacity(ev.detail)}
            />
        </InlineLabeled>
        <InlineLabeled label="Pressure-Size">
            <Switch
                checked={brush.pressureAffectsSize}
                on:change={(ev) => sender.setPressureAffectsSize(ev.detail)}
            />
        </InlineLabeled>
        <Labeled
            label="Delay"
            valuePostfix="ms"
            value={brush.delay.duration.toFixed(0)}
            on:change={(ev) => sendFloat(ev, sender.setSpacing)}
        >
            <Slider
                value={brush.delay.duration / 500}
                on:change={(ev) => sender.setDelay(ev.detail * 500)}
            />
        </Labeled>
    </div>
</Surface>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.detailsContainer {
  background-color: var(--color-surface);
  color: var(--color-onSurface);
  display: flex;
  flex-direction: column;
  width: 12rem;
  padding: 0.5rem 0.75rem;
  height: 100%;
}</style>
