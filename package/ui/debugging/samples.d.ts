import type { PerfTracker } from "../../util";
export declare class SamplesOverTime {
    readonly sample0: readonly PerfTracker.Sample[];
    readonly sample1: readonly PerfTracker.Sample[];
    readonly sample2: readonly PerfTracker.Sample[];
    readonly sample3: readonly PerfTracker.Sample[];
    static empty: SamplesOverTime;
    private constructor();
    update(sample: readonly PerfTracker.Sample[]): SamplesOverTime;
    length(): number;
    forEach(f: (sample: PerfTracker.Sample, index: number) => void): void;
}
export declare const samples: import("svelte/store").Writable<SamplesOverTime>;
