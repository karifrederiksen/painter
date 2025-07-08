// import { ms, type Ms } from "./base";
// import type { StateAtom } from "./states";

// export function performanceTime(): Ms {
// 	return ms(performance.now());
// }

// export function createTicker(stateAtom: StateAtom) {
// 	let rafId: null | number = null;
// 	const scheduleTicks = () => {
// 		stateAtom.send("tick", performanceTime());
// 		rafId = requestAnimationFrame(scheduleTicks);
// 	};
// 	return {
// 		start() {
// 			if (rafId !== null) return;

// 			scheduleTicks();
// 		},
// 		stop() {
// 			if (rafId === null) return;

// 			cancelAnimationFrame(rafId);
// 		},
// 	};
// }
