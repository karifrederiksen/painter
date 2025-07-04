import { useEffect, useReducer } from "react";
import type { Pct } from "~/state";

export function formatPx(pct: number): string {
	const n = pct.toFixed(1);
	return `${n}px`;
}

export function formatPct(pct: Pct): string {
	const n = (pct * 100).toFixed(0);
	return `${n}%`;
}

export function useDoubleInitialRender(): void {
	const forceRender = useReducer((n) => n + 1, 1)[1];
	useEffect(() => {
		forceRender();
	}, []);
}
