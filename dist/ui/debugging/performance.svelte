<script>import { onMount } from "svelte";
import { samples } from "./samples.js";
let samplecount = 0;
let max = Number.MIN_VALUE;
let sum = 0;
onMount(() => {
  return samples.subscribe((samples2) => {
    samplecount = samples2.length();
    max = Number.MIN_VALUE;
    sum = 0;
    samples2.forEach((sample) => {
      const time = sample.endMs - sample.startMs;
      sum += time;
      if (time > max) {
        max = time;
      }
    });
  });
});
</script>

<div>
    <div>Max: {max.toFixed(3)}ms</div>
    <div>Avg: {(sum / samplecount).toFixed(3)}ms</div>
</div>
