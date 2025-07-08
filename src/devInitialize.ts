import { pct, type StateAtom } from "~/state";
import { v2 } from "./util";

export function devInitialize(atom: StateAtom): void {
	atom.send("canvas:setName", "Painting");
	atom.send("canvas:setWidth", "800");
	atom.send("canvas:setHeight", "800");
	// atom.send("canvas:create");
	atom.send("viewport:zoom", pct(1.5));
	atom.send("viewport:rotate", pct(0.4));
	atom.send("viewport:translate", v2.xy(0.5, 0.25));
}
