export class PerfTracker {
    maxSamples;
    onSamples;
    samples;
    nextIdx;
    startTimeMs;
    constructor(args) {
        this.maxSamples = args.maxSamples;
        this.onSamples = args.onSamples;
        this.samples = new Array(args.maxSamples);
        this.nextIdx = 0;
        this.startTimeMs = null;
    }
    start() {
        if (this.startTimeMs !== null) {
            console.error("Performance tracker should not already be in use");
        }
        this.startTimeMs = performance.now();
    }
    end() {
        if (this.startTimeMs === null) {
            console.error("Performance tracker should be started");
        }
        const endMs = performance.now();
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const startMs = this.startTimeMs;
        this.startTimeMs = null;
        this.samples[this.nextIdx++] = { startMs, endMs };
        if (this.nextIdx === this.maxSamples) {
            this.onSamples(this.samples);
            this.samples = new Array(this.maxSamples);
            this.nextIdx = 0;
        }
    }
}
