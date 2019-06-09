import * as React from "react"
import * as Signals from "../signals"
import { PerfTracker } from "../util"

export interface PerformanceProps {
    readonly samplesSignal: Signals.Signal<readonly PerfTracker.Sample[]>
}

export function Performance(props: PerformanceProps) {
    const [samples, setSamples] = React.useState(SamplesOverTime.empty)

    React.useEffect(() => {
        const { dispose } = props.samplesSignal.subscribe(samples =>
            setSamples(x => x.update(samples))
        )

        return dispose
    }, [props.samplesSignal])

    const samplecount = samples.length()
    let max = Number.MIN_VALUE
    let sum = 0
    samples.forEach((sample, index) => {
        const time = sample.endMs - sample.startMs
        sum += time
        if (time > max) {
            max = time
        }
    })

    return (
        <div>
            <div>Max: {max.toFixed(3)} ms</div>
            <div>Avg: {(sum / samplecount).toFixed(3)} ms</div>
        </div>
    )
}

class SamplesOverTime {
    static empty = new SamplesOverTime([], [], [], [])

    private constructor(
        readonly sample0: readonly PerfTracker.Sample[],
        readonly sample1: readonly PerfTracker.Sample[],
        readonly sample2: readonly PerfTracker.Sample[],
        readonly sample3: readonly PerfTracker.Sample[]
    ) {}

    update(sample: readonly PerfTracker.Sample[]) {
        return new SamplesOverTime(sample, this.sample0, this.sample1, this.sample2)
    }

    length() {
        return this.sample0.length + this.sample1.length + this.sample2.length + this.sample3.length
    }

    forEach(f: (sample: PerfTracker.Sample, index: number) => void): void {
        let samples = this.sample0
        let length = 0
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], i)
        }
        length += samples.length
        samples = this.sample1
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i)
        }
        length += samples.length
        samples = this.sample2
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i)
        }
        length += samples.length
        samples = this.sample3
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i)
        }
    }
}

class CircularArray<a> {
    private readonly array: a[]
    private nextIdx: number

    constructor(readonly size: number, readonly defaultValue: a) {
        this.nextIdx = 0
        const array = new Array<a>(size)
        for (let i = 0; i < size; i++) {
            array[i] = defaultValue
        }
        this.array = array
    }

    push(value: a) {
        const nextIdx = this.nextIdx
        this.array[nextIdx] = value
        this.nextIdx = (nextIdx + 1) % this.size
    }
}
