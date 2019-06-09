export namespace PerfTracker {
    export interface Sample {
        readonly startMs: number
        readonly endMs: number
    }
}

export class PerfTracker {
    private readonly maxSamples: number
    private readonly onSamples: (stats: readonly PerfTracker.Sample[]) => void
    private samples: PerfTracker.Sample[]
    private nextIdx: number
    private startTimeMs: number | null

    constructor(args: {
        readonly maxSamples: number
        readonly onSamples: (stats: readonly PerfTracker.Sample[]) => void
    }) {
        this.maxSamples = args.maxSamples
        this.onSamples = args.onSamples
        this.samples = new Array(args.maxSamples)
        this.nextIdx = 0
        this.startTimeMs = null
    }

    start() {
        if (this.startTimeMs !== null) {
            console.error("Performance tracker should not already be in use")
        }
        this.startTimeMs = performance.now()
    }

    end() {
        if (this.startTimeMs === null) {
            console.error("Performance tracker should be started")
        }
        const endMs = performance.now()
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const startMs = this.startTimeMs!
        this.startTimeMs = null

        this.samples[this.nextIdx++] = { startMs, endMs }
        if (this.nextIdx === this.maxSamples) {
            this.onSamples(this.samples)
            this.samples = new Array(this.maxSamples)
            this.nextIdx = 0
        }
    }
}
