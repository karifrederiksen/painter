<script lang="ts">
  import { onMount } from "svelte";
  import { samples } from "./samples";

  let samplecount = 0;
  let max = Number.MIN_VALUE;
  let sum = 0;

  onMount(() => {
    return samples.subscribe((samples) => {
      samplecount = samples.length();
      max = Number.MIN_VALUE;
      sum = 0;
      samples.forEach((sample) => {
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
