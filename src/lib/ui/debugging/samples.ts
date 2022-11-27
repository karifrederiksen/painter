import type { PerfTracker } from "../../util";
import { writable } from "svelte/store";

export class SamplesOverTime {
    static empty = new SamplesOverTime([], [], [], []);

    private constructor(
        readonly sample0: readonly PerfTracker.Sample[],
        readonly sample1: readonly PerfTracker.Sample[],
        readonly sample2: readonly PerfTracker.Sample[],
        readonly sample3: readonly PerfTracker.Sample[],
    ) {}

    update(sample: readonly PerfTracker.Sample[]) {
        return new SamplesOverTime(sample, this.sample0, this.sample1, this.sample2);
    }

    length() {
        return (
            this.sample0.length + this.sample1.length + this.sample2.length + this.sample3.length
        );
    }

    forEach(f: (sample: PerfTracker.Sample, index: number) => void): void {
        let samples = this.sample0;
        let length = 0;
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], i);
        }
        length += samples.length;
        samples = this.sample1;
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i);
        }
        length += samples.length;
        samples = this.sample2;
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i);
        }
        length += samples.length;
        samples = this.sample3;
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i);
        }
    }
}

export const samples = writable<SamplesOverTime>(SamplesOverTime.empty);
