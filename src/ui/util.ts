import type { Pct } from "~/state";

export function formatPx(pct: number): string {
	const n = pct.toFixed(1);
	return `${n}px`;
}

export function formatPct(pct: Pct): string {
	const n = (pct * 100).toFixed(0);
	return `${n}%`;
}
