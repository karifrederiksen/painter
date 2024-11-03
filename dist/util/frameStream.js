export const FrameStream = {
    make: (fn) => {
        let shouldStop = false;
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        window["painterStop"] = () => (shouldStop = true);
        let requestId = requestAnimationFrame(function callback() {
            if (shouldStop)
                return;
            try {
                fn(performance.now());
            }
            catch (e) {
                console.error(e);
            }
            requestId = requestAnimationFrame(callback);
        });
        return () => cancelAnimationFrame(requestId);
    },
};
