
export class Vec4 {
    constructor(
        readonly x: number,
        readonly y: number,
        readonly z: number,
        readonly w: number
    ){}

    eq(other: Vec4): boolean {
        return (
            this.x === other.x &&
            this.y === other.y &&
            this.z === other.z &&
            this.w === other.w
        )
    }
}