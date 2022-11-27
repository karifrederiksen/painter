export interface FrameStream {
    (fn: (time: number) => void): CancelFrameStream;
}

export interface CancelFrameStream {
    (): void;
}

export const FrameStream = {
    make: (fn: (time: number) => void): CancelFrameStream => {
        let shouldStop = false;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        (window as any)["painterStop"] = () => (shouldStop = true);

        let requestId = requestAnimationFrame(function callback() {
            if (shouldStop) return;
            try {
                fn(performance.now());
            } catch (e) {
                console.error(e);
            }
            requestId = requestAnimationFrame(callback);
        });
        return () => cancelAnimationFrame(requestId);
    },
};
