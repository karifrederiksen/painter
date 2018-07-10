import { toLinear } from "./utility"

export interface Color {
    toRgb(): Rgb
}

export class Rgb255 implements Color {
    static make(r: number, g: number, b: number): Rgb255 {
        return new Rgb255(r | 0, g | 0, b | 0)
    }

    private constructor(readonly r: number, readonly g: number, readonly b: number) {}

    eq(other: Rgb255): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    toRgb(): Rgb {
        return Rgb.make(this.r / 255, this.g / 255, this.b / 255)
    }

    // TODO: move this function to the consumer
    toStyleString(): string {
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")"
    }

    pipe<b>(fn: (val: this) => b): b {
        return fn(this)
    }

    toString(): string {
        return "Rgb255( r: " + this.r + ", g: " + this.g + ", b: " + this.b + " )"
    }
}

/*
    This RGB is linear, so it's great for mixing, but its values
    should never be used directly for displaying.
    Convert to CSS color: toCss()
    Convert to 8 bit sRGB: toRgb255()
*/
export class Rgb {
    static readonly Black = new Rgb(0, 0, 0)
    static readonly White = new Rgb(1, 1, 1)
    static readonly Grey = Rgb.make(0.5, 0.5, 0.5)
    static readonly Red = new Rgb(1, 0, 0)
    static readonly Green = new Rgb(0, 1, 0)
    static readonly Blue = new Rgb(0, 0, 1)
    static readonly Yellow = new Rgb(1, 1, 0)
    static readonly Magenta = new Rgb(1, 0, 1)
    static readonly Cyan = new Rgb(0, 1, 1)

    static make(r: number, g: number, b: number): Rgb {
        return new Rgb(r, g, b)
    }

    private cachedLinearRgb: LinearRgb | null = null
    private constructor(readonly r: number, readonly g: number, readonly b: number) {}

    eq(other: Rgb): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    toLinear(): LinearRgb {
        if (this.cachedLinearRgb === null) {
            const lrgb = LinearRgb.make(toLinear(this.r), toLinear(this.g), toLinear(this.b))
            this.cachedLinearRgb = lrgb
        }
        return this.cachedLinearRgb
    }

    toRgb255(): Rgb255 {
        const { r, g, b } = this
        return Rgb255.make(pctToByte(r), pctToByte(g), pctToByte(b))
    }

    toString(): string {
        const { r, g, b } = this
        return "Rgb( r: " + r + ", g: " + g + ", b: " + b + " )"
    }

    toCss(): string {
        const { r, g, b } = this
        return "Rgb(" + pctToByte(r) + "," + pctToByte(g) + "," + pctToByte(b) + ")"
    }
}

export class LinearRgb {
    static Black = new LinearRgb(0, 0, 0)
    static White = new LinearRgb(0, 0, 0)

    static make(r: number, g: number, b: number): LinearRgb {
        return new LinearRgb(r, g, b)
    }

    private constructor(readonly r: number, readonly g: number, readonly b: number) {}

    mix(pct: number, other: LinearRgb): LinearRgb {
        const dr = other.r - this.r
        const dg = other.g - this.g
        const db = other.b - this.b
        return new LinearRgb(this.r + dr * pct, this.g + dg * pct, this.b + db * pct)
    }

    lighten(pct: number): LinearRgb {
        return this.mix(pct, LinearRgb.White)
    }

    darken(pct: number): LinearRgb {
        return this.mix(pct, LinearRgb.Black)
    }

    eq(other: LinearRgb): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    toGray(): number {
        const { r, g, b } = this
        return Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b)
    }

    toString(): string {
        const { r, g, b } = this
        return "LinearRgb( r: " + r + ", g: " + g + ", b: " + b + " )"
    }
}

function pctToByte(pct: number): number {
    return (pct * 255.999999999) | 0
}
