import { T2 } from "../data"

// Consider reworking this so it just sends out an array and leaves the computations to whoever receives it

export interface Stats {
    readonly actualFps: number
    readonly potentialFps: number
    readonly avgFrameTime: number
    readonly minFrameTime: number
    readonly maxFrameTime: number
}

export interface RenderStatsArgs {
    readonly maxSamples: number
    readonly outputFrequency: number
    readonly onStats: (stats: Stats) => void
}

export class RenderStats {
    private readonly maxSamples: number
    private readonly outputFrequency: number
    private readonly onStats: (stats: Stats) => void
    private readonly samples: Array<T2<number, number>>
    private sampleCount: number
    private nextIndex: number

    constructor(args: RenderStatsArgs) {
        this.maxSamples = args.maxSamples
        this.outputFrequency = args.outputFrequency
        this.onStats = args.onStats
        this.samples = new Array<T2<number, number>>()
        this.sampleCount = 0
        this.nextIndex = 0
    }

    timedRender<a>(arg: a, render: (arg: a) => void): void {
        const start = performance.now()
        render(arg)
        const end = performance.now()

        this.samples[this.nextIndex] = [start, end]
        this.nextIndex = (this.nextIndex + 1) % this.maxSamples

        if (++this.sampleCount % this.outputFrequency === 0) this.outputStats()
    }

    private outputStats(): void {
        const { samples, nextIndex, maxSamples, sampleCount } = this
        const count = Math.min(sampleCount, maxSamples)

        let minFrameTime = Number.MAX_VALUE
        let maxFrameTime = Number.MIN_VALUE
        let totalFrameTime = 0

        for (let i = 0; i < count; i++) {
            const delta = samples[i][1] - samples[i][0]

            totalFrameTime += delta
            if (delta < minFrameTime) minFrameTime = delta
            if (delta > minFrameTime) maxFrameTime = delta
        }

        const avgFrameTime = totalFrameTime / count

        const endIndex = this.previousIndex(nextIndex)
        const startIndex = nextIndex < sampleCount ? nextIndex : 0

        const totalTime = samples[endIndex][1] - samples[startIndex][0]

        this.onStats({
            actualFps: (count / totalTime) * 1000,
            potentialFps: 1000 / avgFrameTime,
            avgFrameTime,
            minFrameTime,
            maxFrameTime,
        })
    }

    private previousIndex(index: number): number {
        return index > 0 ? index - 1 : this.sampleCount >= this.maxSamples ? this.maxSamples - 1 : 0
    }
}
