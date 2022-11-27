<script lang="ts">
    import { Labeled } from "../labeled";
    import Slider from "./slider.svelte";

    export let label: string;
    export let valuePostfix: string | undefined = undefined;
    export let value: number;
    export let toString: (value: number) => string;
    export let fromString: (text: string) => number | null;
    export let percentage: number;
    export let onChange: (value: number) => void;
</script>

<Labeled {label} {valuePostfix} {value} {toString} {fromString} {onChange}>
    <Slider {percentage} {onChange} />
</Labeled>
