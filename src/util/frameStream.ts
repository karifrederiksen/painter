export interface FrameStream {
    (fn: (time: number) => void): CancelFrameStream
}

export interface CancelFrameStream {
    (): void
}

export const FrameStream = {
    make: (fn: (time: number) => void): CancelFrameStream => {
        let shouldStop = false
        ;(window as any)["painterStop"] = () => (shouldStop = true)

        const callback = () => {
            if (shouldStop) return
            try {
                fn(performance.now())
            } catch (e) {
                console.error(e)
            }
            requestId = requestAnimationFrame(callback)
        }
        let requestId = requestAnimationFrame(callback)
        return () => cancelAnimationFrame(requestId)
    },
}
