import * as Color from "color";
import {
	DEFINE_TAU,
	createProgram,
	DEFINE_hsluv_etc,
	DEFINE_hsvToRgb,
} from "~/webgl";
import { ColorMode, clamp, v2, wrap } from "~/util";
import type React from "react";
import { useStream, type Send, type Stream } from "~/state";
import { useEffect, useRef } from "react";
import { useDoubleInitialRender } from "./util";

export interface ColorWheelProps {
	color$: Stream<Color.Hsluv>;
	colorMode$: Stream<ColorMode>;
	send: Send;
}

export function ColorWheel({
	color$,
	colorMode$,
	send,
}: ColorWheelProps): React.JSX.Element {
	const color = useStream(color$);
	const colorMode = useStream(colorMode$);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const glStateRef = useRef<GlState | null>(null);
	const pointerStateRef = useRef<PointerState>(PointerState.Default);
	useDoubleInitialRender();

	useEffect(() => {
		glStateRef.current = new GlState(canvasRef.current!);
	}, []);

	useEffect(() => {
		glStateRef.current!.render(colorMode, color);
	}, [colorMode, color]);

	useEffect(() => {
		const onUp = (ev: PointerEvent) => {
			ev.preventDefault();
			pointerStateRef.current = PointerState.Default;
		};

		const onMove = (ev: PointerEvent) => {
			switch (pointerStateRef.current) {
				case PointerState.Default:
					break;
				case PointerState.DownOnInner:
					ev.preventDefault();
					signalInner(
						ev,
						containerRef.current!,
						send,
						colorMode$.getValue(),
						color$.getValue(),
					);
					break;
				case PointerState.DownOnOuter:
					ev.preventDefault();
					signalOuter(
						ev,
						containerRef.current!,
						send,
						colorMode$.getValue(),
						color$.getValue(),
					);
					break;
				default:
					pointerStateRef.current satisfies never;
					throw new Error(
						`unexpected pointerState "${pointerStateRef.current}"`,
					);
			}
		};
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointerleave", onUp);
		window.addEventListener("pointermove", onMove);
		return () => {
			pointerStateRef.current = PointerState.Default;
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointerleave", onUp);
			window.removeEventListener("pointermove", onMove);
		};
	}, [colorMode$, color$]);

	const canvasRect = canvasRef.current?.getBoundingClientRect();
	const thumbData = canvasRect
		? getThumbPositions(canvasRect, colorMode, color)
		: null;
	return (
		<div
			className="relative w-full aspect-square"
			ref={containerRef}
			onPointerDown={(ev) =>
				onDown(
					ev,
					containerRef.current!,
					send,
					colorMode,
					color,
					(x) => (pointerStateRef.current = x),
				)
			}
		>
			<canvas ref={canvasRef} width="182" height="182" />
			<div
				className="absolute w-5 h-3 border-solid border-2 rounded-2xl"
				style={{
					left: `${thumbData?.circleThumb.x ?? 0}px`,
					top: `${thumbData?.circleThumb.y ?? 0}px`,
					backgroundColor: color.toStyle(),
					borderColor: color.l > 50 ? "black" : "white",
					transform: `rotate(${thumbData?.angle ?? 0}deg)`,
				}}
			/>
			<div
				className="absolute w-4 h-4 border-solid border-2 rounded-full"
				style={{
					left: `${thumbData?.areaThumb.x ?? 0}px`,
					top: `${thumbData?.areaThumb.y ?? 0}px`,
					backgroundColor: color.toStyle(),
					borderColor: color.l > 50 ? "black" : "white",
				}}
			/>
		</div>
	);
}

const CENTER_SQUARE_PCT = 0.55;
const MARGIN = (1 - CENTER_SQUARE_PCT) / 2;

const enum PointerState {
	Default,
	DownOnInner,
	DownOnOuter,
}

type WithClientXY = Readonly<{
	clientX: number;
	clientY: number;
}>;

function signalOuter(
	ev: WithClientXY,
	container: HTMLElement,
	send: Send,
	colorMode: ColorMode,
	color: Color.Hsluv,
) {
	// get xy delta from the center of the ring
	const bounds = container.getBoundingClientRect();
	const x = ev.clientX - bounds.left - bounds.width * 0.5;
	const y = ev.clientY - bounds.top - bounds.height * 0.5;

	// get hue from radians (keep in mind the ring is turned 50%)
	const radians = Math.atan2(y, x);
	const hue = radians / (Math.PI * 2) + 0.5;

	switch (colorMode) {
		case ColorMode.Hsv: {
			const hsv = Color.rgbToHsv(color.toRgb());
			const nextColor = Color.rgbToHsluv(hsv.with({ h: hue }).toRgb());
			send("brush:setColor", nextColor);
			break;
		}
		case ColorMode.Hsluv: {
			const nextColor = color.with({ h: hue * 360 });
			send("brush:setColor", nextColor);
			break;
		}
	}
}

const onDown = (
	ev: WithClientXY,
	container: HTMLElement,
	send: Send,
	colorMode: ColorMode,
	color: Color.Hsluv,
	setPointerState: (state: PointerState) => void,
) => {
	const bounds = container.getBoundingClientRect();
	const x = clamp(ev.clientX - bounds.left, 0, bounds.width);
	const y = clamp(ev.clientY - bounds.top, 0, bounds.height);

	const marginX = bounds.width * MARGIN;
	const marginY = bounds.height * MARGIN;

	const isInner =
		isInclusive(x, marginX, bounds.width - marginX) &&
		isInclusive(y, marginY, bounds.height - marginY);

	if (isInner) {
		setPointerState(PointerState.DownOnInner);
		signalInner(ev, container, send, colorMode, color);
	} else {
		setPointerState(PointerState.DownOnOuter);
		signalOuter(ev, container, send, colorMode, color);
	}
};

function signalInner(
	ev: WithClientXY,
	container: HTMLElement,
	send: Send,
	colorMode: ColorMode,
	color: Color.Hsluv,
) {
	const bounds = container.getBoundingClientRect();
	const marginX = bounds.width * MARGIN;
	const marginY = bounds.height * MARGIN;

	const width = bounds.width - marginX * 2;
	const height = bounds.height - marginY * 2;

	const x = clamp(ev.clientX - bounds.left - marginX, 0, width);
	const y = clamp(ev.clientY - bounds.top - marginY, 0, height);

	console.log(x, y);
	const pctX = x / width;
	const pctY = 1 - y / height;

	switch (colorMode) {
		case ColorMode.Hsv: {
			const hue = Color.rgbToHsv(color.toRgb()).h;
			const nextColor = Color.rgbToHsluv(
				Color.hsvToRgb(new Color.Hsv(hue, pctX, pctY)),
			);
			send("brush:setColor", nextColor);
			break;
		}
		case ColorMode.Hsluv: {
			const hue = color.h;
			const nextColor = new Color.Hsluv(hue, pctX * 100, pctY * 100);
			send("brush:setColor", nextColor);
			break;
		}
	}
}

const isInclusive = (n: number, min: number, max: number): boolean => {
	return n >= min && n <= max;
};

interface ThumbPositions {
	angle: number;
	circleThumb: v2;
	areaThumb: v2;
}

function getThumbPositions(
	canvasRect: DOMRect,
	colorType: ColorMode,
	color: Color.Hsluv,
): ThumbPositions {
	let hueAngle: number;
	let satValPct: v2;
	if (colorType === ColorMode.Hsluv) {
		hueAngle = wrap(color.h + 180, 0, 360);
		satValPct = v2.xy(color.s / 100, 1 - color.l / 100);
	} else {
		const hsv = Color.rgbToHsv(color.toRgb());
		hueAngle = hsv.h;
		satValPct = v2.xy(hsv.s, 1 - hsv.v);
	}

	const canvasSize = v2.xy(canvasRect.width, canvasRect.height);

	const circleThumb = v2
		.xy(1, 0)
		.turn(hueAngle / 360)
		.addNum(1)
		.divNum(2)
		.mul(canvasSize.subNum(16))
		.add(v2.xy(-2, 2));

	const areaThumb = satValPct
		.mulNum(CENTER_SQUARE_PCT)
		.addNum(CENTER_SQUARE_PCT / 2)
		.mul(canvasSize)
		.subNum(17);

	return {
		angle: hueAngle,
		circleThumb,
		areaThumb,
	};
}

class GlState {
	private readonly gl: WebGLRenderingContext;
	private readonly ringRenderer: RingRenderer;
	private readonly satValRenderer: SatValRenderer;

	constructor(readonly canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl");
		if (gl === null) {
			throw new Error("Failed to init webgl");
		}

		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);

		this.gl = gl;
		this.ringRenderer = new RingRenderer(gl);
		this.satValRenderer = new SatValRenderer(gl);
	}

	render(colorMode: ColorMode, color: Color.Hsluv) {
		this.gl.clearColor(0, 0, 0, 0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.ringRenderer.render(colorMode, color);
		this.satValRenderer.render(colorMode, color);
	}

	dispose() {
		this.ringRenderer.dispose();
		this.satValRenderer.dispose();
	}
}

const RING_VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_position = a_position;
}
`;

function makeRingFragSrc(DEFINE_toRgb: string) {
	return `
    precision highp float;
    
    ${DEFINE_TAU}

    ${DEFINE_toRgb}
    
    #define INNER_RAD1 0.83
    #define INNER_RAD2 0.85
    #define OUTER_RAD1 0.98
    #define OUTER_RAD2 1.00
    
    varying vec2 v_position;
    
    uniform vec3 u_color;
    
    void main() {
        vec2 pos = v_position * vec2(1.0, -1.0);
        float dist = sqrt(dot(pos, pos));
    
        float a = smoothstep(INNER_RAD1, INNER_RAD2, dist) - smoothstep(OUTER_RAD1, OUTER_RAD2, dist);
    
        float radians = atan(pos.y, pos.x);
        float hue = (radians / TAU) + 0.5;
    
        vec3 hsluv = vec3(hue, 1.0, a);
    
        gl_FragColor = vec4(toRgb(u_color, hsluv) * a, a);
    }
    `;
}

const RING_FRAG_SRC_HSV = makeRingFragSrc(`
${DEFINE_hsvToRgb}

vec3 toRgb(vec3 color, vec3 xyz) {
    return hsvToRgb(xyz * vec3(1.0, color.y, color.z));
}
`);

const RING_FRAG_SRC_HSLUV = makeRingFragSrc(`
${DEFINE_hsluv_etc}

vec3 toRgb(vec3 color, vec3 xyz) {
    return hsluvToRgb(xyz * vec3(360.0, color.y, color.z));
}
`);

class RingRenderer {
	private readonly buffer: WebGLBuffer;
	private program: WebGLProgram | null = null;
	private colorLocation: WebGLUniformLocation | null = null;
	private prevColorType: ColorMode | null = null;

	constructor(private readonly gl: WebGLRenderingContext) {
		this.buffer = gl.createBuffer() as WebGLBuffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
			gl.STATIC_DRAW,
		);
	}

	render(colorType: ColorMode, color: Color.Hsluv): void {
		if (!this.program || this.prevColorType !== colorType) {
			if (this.program) {
				this.gl.deleteProgram(this.program);
			}

			switch (colorType) {
				case ColorMode.Hsv:
					this.program = createProgram(
						this.gl,
						RING_VERT_SRC,
						RING_FRAG_SRC_HSV,
					) as WebGLProgram;
					break;
				case ColorMode.Hsluv:
					this.program = createProgram(
						this.gl,
						RING_VERT_SRC,
						RING_FRAG_SRC_HSLUV,
					) as WebGLProgram;
					break;
			}
			this.gl.bindAttribLocation(this.program as WebGLProgram, 0, "a_position");
			this.colorLocation = this.gl.getUniformLocation(
				this.program as WebGLProgram,
				"u_color",
			) as WebGLUniformLocation;
			this.prevColorType = colorType;
		}

		this.gl.useProgram(this.program);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(0);

		switch (colorType) {
			case ColorMode.Hsv: {
				const hsv = Color.rgbToHsv(Color.hsluvToRgb(color));
				this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v);
				break;
			}
			case ColorMode.Hsluv: {
				this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l);
				break;
			}
		}

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
	}

	dispose(): void {
		this.gl.deleteBuffer(this.buffer);
		this.gl.deleteProgram(this.program);
	}
}

const SATVAL_VERT_SRC = `
precision highp float;

attribute vec2 a_position;

varying vec2 v_tex_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    v_tex_position = ((a_position / ${CENTER_SQUARE_PCT.toFixed(2)}) + 1.0) / 2.0;
}
`;

function makeSatValFragSrc(DEFINE_toRgb: string): string {
	return `
    precision highp float;

    ${DEFINE_toRgb}
    
    varying vec2 v_tex_position;
    
    uniform vec3 u_color;
    
    void main() {
        // mix saturation from left to right [0, 1]
        // mix value from bottom to top: [0, 1]
        float x = v_tex_position.x;
        float y = v_tex_position.y;
    
        gl_FragColor = vec4(
            toRgb(u_color.x, x, y),
            1.0
        );
    }
    `;
}

const SATVAL_FRAG_SRC_HSV = makeSatValFragSrc(`
${DEFINE_hsvToRgb}

vec3 toRgb(float hue, float x, float y) {
    return hsvToRgb(vec3(hue, x, y));
}
`);

const SATVAL_FRAG_SRC_HSLUV = makeSatValFragSrc(`
${DEFINE_hsluv_etc}

vec3 toRgb(float hue, float x, float y) {
    return hsluvToRgb(vec3(hue, x * 100.0, y * 100.0));
}
`);

class SatValRenderer {
	private readonly buffer: WebGLBuffer;
	private colorLocation: WebGLUniformLocation | null = null;
	private program: WebGLProgram | null = null;
	private prevColorMode: ColorMode | null = null;

	constructor(private readonly gl: WebGLRenderingContext) {
		this.buffer = gl.createBuffer() as WebGLBuffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([
				// 1
				CENTER_SQUARE_PCT,
				CENTER_SQUARE_PCT,
				// 2
				-CENTER_SQUARE_PCT,
				CENTER_SQUARE_PCT,
				// 3
				CENTER_SQUARE_PCT,
				-CENTER_SQUARE_PCT,
				// 4
				-CENTER_SQUARE_PCT,
				CENTER_SQUARE_PCT,
				// 5
				CENTER_SQUARE_PCT,
				-CENTER_SQUARE_PCT,
				// 6
				-CENTER_SQUARE_PCT,
				-CENTER_SQUARE_PCT,
			]),
			gl.STATIC_DRAW,
		);
	}

	render(colorMode: ColorMode, color: Color.Hsluv): void {
		const gl = this.gl;

		if (!this.program || this.prevColorMode !== colorMode) {
			if (this.program) {
				gl.deleteProgram(this.program);
			}

			switch (colorMode) {
				case ColorMode.Hsv:
					this.program = createProgram(
						gl,
						SATVAL_VERT_SRC,
						SATVAL_FRAG_SRC_HSV,
					);
					break;
				case ColorMode.Hsluv:
					this.program = createProgram(
						gl,
						SATVAL_VERT_SRC,
						SATVAL_FRAG_SRC_HSLUV,
					);
					break;
				default: {
					colorMode satisfies never;
					throw new Error(`unexpected color mode "${colorMode}"`);
				}
			}

			gl.bindAttribLocation(this.program as WebGLProgram, 0, "a_position");
			this.colorLocation = gl.getUniformLocation(
				this.program as WebGLProgram,
				"u_color",
			) as WebGLUniformLocation;
		}
		gl.useProgram(this.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);

		switch (colorMode) {
			case ColorMode.Hsv: {
				const hsv = Color.rgbToHsv(Color.hsluvToRgb(color));
				this.gl.uniform3f(this.colorLocation, hsv.h, hsv.s, hsv.v);
				break;
			}
			case ColorMode.Hsluv: {
				this.gl.uniform3f(this.colorLocation, color.h, color.s, color.l);
				break;
			}
		}

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		this.prevColorMode = colorMode;
	}

	dispose(): void {
		const gl = this.gl;
		gl.deleteBuffer(this.buffer);
		gl.deleteProgram(this.program);
	}
}
