import { useEffect, useRef, type JSX } from "react";
import { StreamSource, useStream, type Stream } from "./stream";

export interface WhenStreamProps<A, B extends A> {
	stream: Stream<A>;
	cond: (val: A) => val is B;
	render: (val: Stream<B>) => JSX.Element;
}

export function WhenStream<A, B extends A>({
	stream,
	cond,
	render,
}: WhenStreamProps<A, B>) {
	const val = useStream(stream);
	const sourceRef = useRef<StreamSource<B> | null>(null);
	useEffect(() => {
		const { unsubscribe } = stream.subscribe((val) => {
			if (!cond(val)) return;

			if (sourceRef.current) {
				sourceRef.current.next(val);
			} else {
				sourceRef.current = new StreamSource<B>(val);
			}
		});
		return unsubscribe;
	}, [stream, cond]);

	if (!cond(val)) {
		sourceRef.current = null;
		return null;
	}
	sourceRef.current ??= new StreamSource<B>(val);
	return render(sourceRef.current.stream());
}
