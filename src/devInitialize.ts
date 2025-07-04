import { pct, type StateAtom } from "~/state/state";
import { v2 } from "./util";

export function devInitialize(atom: StateAtom): void {
	atom.send("canvas:create", {
		name: "Painting",
		width: 800,
		height: 800,
	});
	atom.send("viewport:zoom", pct(1.5));
	atom.send("viewport:rotate", pct(0.4));
	atom.send("viewport:translate", v2.xy(0.5, 0.25));
}
