export interface Sample {
    readonly startMs: number
    readonly endMs: number
}

export interface Args {
    readonly maxSamples: number
    readonly onSamples: (stats: ReadonlyArray<Sample>) => void
}

export class PerfTracker {
    private readonly maxSamples: number
    private readonly onSamples: (stats: ReadonlyArray<Sample>) => void
    private samples: Array<Sample>
    private nextIdx = 0
    private startTimeMs: number | null = null

    constructor(args: Args) {
        this.maxSamples = args.maxSamples
        this.onSamples = args.onSamples
        this.samples = new Array(args.maxSamples)
    }

    start() {
        console.assert(
            this.startTimeMs === null,
            "Performance tracker should not already be in use"
        )
        this.startTimeMs = performance.now()
    }

    end() {
        console.assert(this.startTimeMs !== null, "Performance tracker should be started")
        const endMs = performance.now()
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
