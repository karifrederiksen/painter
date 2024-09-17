export interface Sample {
    readonly startMs: number;
    readonly endMs: number;
}
export declare class PerfTracker {
    private readonly maxSamples;
    private readonly onSamples;
    private samples;
    private nextIdx;
    private startTimeMs;
    constructor(args: {
        readonly maxSamples: number;
        readonly onSamples: (stats: readonly Sample[]) => void;
    });
    start(): void;
    end(): void;
}
