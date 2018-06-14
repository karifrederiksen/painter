
export interface Color {
    toRgb(): Rgb
}

export class Rgb255 implements Color {
    static make(r: number, g: number, b: number): Rgb255 {
        return new Rgb255(r | 0, g | 0, b | 0)
    }

    private constructor(
        readonly r: number,
        readonly g: number,
        readonly b: number,
    ) {}

    with(
        args: Readonly<{
            r?: number
            g?: number
            b?: number
        }>,
    ): Rgb255 {
        return new Rgb255(
            args.r !== void 0 ? args.r : this.r,
            args.g !== void 0 ? args.g : this.g,
            args.b !== void 0 ? args.b : this.b,
        )
    }

    map(fn: (val: number) => number): Rgb255 {
        return new Rgb255(fn(this.r) | 0, fn(this.g) | 0, fn(this.b) | 0)
    }

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
        return (
            "Rgb255( r: " + this.r + ", g: " + this.g + ", b: " + this.b + " )"
        )
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
        return new Rgb(toLinear(r), toLinear(g), toLinear(b))
    }

    static makeFromLinear(r: number, g: number, b: number): Rgb {
        return new Rgb(r, g, b)
    }

    private constructor(
        readonly r: number,
        readonly g: number,
        readonly b: number,
    ) {}

    with(
        args: Readonly<{
            r?: number
            g?: number
            b?: number
        }>,
    ): Rgb {
        return new Rgb(
            args.r !== void 0 ? toLinear(args.r) : this.r,
            args.g !== void 0 ? toLinear(args.g) : this.g,
            args.b !== void 0 ? toLinear(args.b) : this.b,
        )
    }

    mix(pct: number, other: Rgb): Rgb {
        const dr = other.r - this.r
        const dg = other.g - this.g
        const db = other.b - this.b
        return new Rgb(this.r + dr * pct, this.g + dg * pct, this.b + db * pct)
    }

    lighten(pct: number): Rgb {
        return this.mix(pct, Rgb.White)
    }

    darken(pct: number): Rgb {
        return this.mix(pct, Rgb.Black)
    }

    eq(other: Rgb): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    toRgb(): Rgb {
        return this
    }

    toRgb255(): Rgb255 {
        const { r, g, b } = this
        return Rgb255.make(
            fromLinearToByte(r),
            fromLinearToByte(g),
            fromLinearToByte(b),
        )
    }

    pipe<b>(fn: (val: this) => b): b {
        return fn(this)
    }

    toString(): string {
        const { r, g, b } = this
        return "Rgb( r: " + r + ", g: " + g + ", b: " + b + " )"
    }

    toCss(): string {
        const { r, g, b } = this
        return [
            "Rgb(",
            fromLinearToByte(r).toString(),
            ",",
            fromLinearToByte(g).toString(),
            ",",
            fromLinearToByte(b).toString(),
            ")",
        ].join("")
    }

    toGray(): number {
        const { r, g, b } = this
        return Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b)
    }
}

function pctToByte(pct: number): number {
    return (pct * 255.999999999) | 0
}

function toLinear(val: number): number {
    return val ** 2.2
}

function fromLinear(val: number): number {
    return val ** (1 / 2.2)
}

function fromLinearToByte(val: number): number {
    return pctToByte(fromLinear(val))
}