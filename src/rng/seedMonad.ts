// export interface StateMonad<input, output> {
//     bind<b>(f: (val: output) => SeedMonad<input, b>): SeedMonad<input, b>
//     map<b>(f: (val: output) => b): SeedMonad<input, b>
//     return(seed: input): [output, input]
// }

// export namespace SeedMonad {
//     export function create(): SeedMonad<null, null> {
//         return SeedMonadBase.initial
//     }
// }

// class SeedMonadBase implements SeedMonad<null> {
//     static initial: SeedMonad<null> = new SeedMonadBase()

//     bind<b>(f: (val: null) => SeedMonad<b>): SeedMonad<b> {
//         return new SeedMonadBind<null, b>(this, f)
//     }

//     map<b>(f: (val: null) => b): SeedMonad<b> {
//         return new SeedMonadMap<null, b>(this, f)
//     }

//     return(seed: Seed): [null, Seed] {
//         return [null, seed]
//     }
// }

// class SeedMonadBind<parentValue, value> implements SeedMonad<value> {
//     constructor(
//         private readonly parent: SeedMonad<parentValue>,
//         private readonly f: (val: parentValue) => SeedMonad<value>
//     ) {}

//     bind<b>(f: (val: value) => SeedMonad<b>): SeedMonad<b> {
//         return new SeedMonadBind<value, b>(this, f)
//     }

//     map<b>(f: (val: value) => b): SeedMonad<b> {
//         return new SeedMonadMap<value, b>(this, f)
//     }

//     return(seed: Seed): [value, Seed] {
//         const [parentValue, seed2] = this.parent.return(seed)
//         return this.f(parentValue).return(seed2)
//     }
// }

// class SeedMonadMap<parentValue, value> implements SeedMonad<value> {
//     constructor(
//         private readonly parent: SeedMonad<parentValue>,
//         private readonly f: (val: parentValue) => value
//     ) {}

//     bind<b>(f: (val: value) => SeedMonad<b>): SeedMonad<b> {
//         return new SeedMonadBind<value, b>(this, f)
//     }

//     map<b>(f: (val: value) => b): SeedMonad<b> {
//         return new SeedMonadMap<value, b>(this, f)
//     }

//     return(seed: Seed): [value, Seed] {
//         const [parentValue, seed2] = this.parent.return(seed)
//         return [this.f(parentValue), seed2]
//     }
// }
