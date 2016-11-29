module TSPainter {

	// Callback definition
	export type Callback = ((obj) => any);

	// Find a HtmlCanvasElement by its element id. Return null if not found.
    export function getCanvasById(id: string): HTMLCanvasElement {
        const element = document.getElementById(id);
        return (element instanceof HTMLCanvasElement) ? element : null;
	}

	// Find a SVGElement by its element id. Return null if not found.
	export function getSvgById(id: string): SVGElement {
		const element = document.getElementById(id);
		return (element instanceof SVGElement) ? element : null;
	}

	// I should find a way to save JSON as cookies
	// Set a cookie
	export function setCookie(cname: string, cvalue: any, exDays: number) {
		const d = new Date();
		d.setTime(d.getTime() + (exDays * 86400000));
		document.cookie = [
			cname, "=", cvalue,
			";expires=", d.toUTCString(),
			";path=/"
		].join("");
	}


	// Get a cookie
	export function getCookie(cname: string) {
		const name = cname + "=";
		const cookieJar = document.cookie.split(";");
		let c = "";

		for (let i = 0, ilen = cookieJar.length; i < ilen; i++) {
			c = cookieJar[i];
			while (c.charAt(0) === " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return null;
	}
}