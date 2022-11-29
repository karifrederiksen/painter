import { writable } from "svelte/store";
export class SamplesOverTime {
    sample0;
    sample1;
    sample2;
    sample3;
    static empty = new SamplesOverTime([], [], [], []);
    constructor(sample0, sample1, sample2, sample3) {
        this.sample0 = sample0;
        this.sample1 = sample1;
        this.sample2 = sample2;
        this.sample3 = sample3;
    }
    update(sample) {
        return new SamplesOverTime(sample, this.sample0, this.sample1, this.sample2);
    }
    length() {
        return (this.sample0.length + this.sample1.length + this.sample2.length + this.sample3.length);
    }
    forEach(f) {
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
export const samples = writable(SamplesOverTime.empty);
