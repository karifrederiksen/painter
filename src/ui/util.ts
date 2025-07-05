import { useLayoutEffect, useReducer } from "react";
import type { Ms, Pct } from "~/state";

export function formatMs(ms: Ms): string {
	const n = ms.toFixed(0);
	return `${n} ms`;
}

export function formatPx(pct: number): string {
	const n = pct.toFixed(1);
	return `${n} px`;
}

export function formatPct(pct: Pct): string {
	const n = (pct * 100).toFixed(0);
	return `${n} %`;
}

export function useDoubleInitialRender(): void {
	const forceRender = useReducer((n) => n + 1, 1)[1];
	useLayoutEffect(() => {
		forceRender();
	}, []);
}
