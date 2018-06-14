export interface FrameStream {
    (fn: (time: number) => void): CancelFrameStream
}

export interface CancelFrameStream {
    (): void
}

export const frameStream: FrameStream = (fn: (time: number) => void): CancelFrameStream => {
    const callback = () => {
        try {
            fn(performance.now())
        } catch (e) {
            console.error(e)
        }
        requestId = requestAnimationFrame(callback)
    }
    let requestId = requestAnimationFrame(callback)
    return () => cancelAnimationFrame(requestId)
}
