import { useEffect, useState } from "react";

export interface BaseStream<A> {
	getValue(): A;
	subscribe(f: (val: A) => void): Subscription;
}

export interface Stream<A> extends BaseStream<A> {
	multicast(): Stream<A>;
	map<B>(transform: (val: A) => B): Stream<B>;
}

export interface Subscription {
	unsubscribe(): void;
}

export class StreamMap<A, B> implements Stream<B> {
	readonly #baseStream: BaseStream<A>;
	readonly #transform: (val: A) => B;

	constructor(baseStream: BaseStream<A>, transform: (val: A) => B) {
		this.#baseStream = baseStream;
		this.#transform = transform;
	}

	getValue(): B {
		return this.#transform(this.#baseStream.getValue());
	}

	multicast(): Stream<B> {
		return new StreamMulticast(this);
	}

	map<C>(transform: (val: B) => C): Stream<C> {
		return new StreamMap<B, C>(this, transform);
	}

	subscribe(f: (val: B) => void): Subscription {
		return this.#baseStream.subscribe((val) => {
			const nextVal = this.#transform(val);
			f(nextVal);
		});
	}
}

export class StreamMulticast<A> implements Stream<A> {
	readonly #baseStream: BaseStream<A>;
	readonly #subscribers: ((state: A) => void)[] = [];
	readonly #subscriberIds: number[] = [];
	#subscription: Subscription | null = null;
	#nextSubscriptionId: number = 1;
	#value: A;

	constructor(baseStream: BaseStream<A>) {
		this.#baseStream = baseStream;
		this.#value = baseStream.getValue();
	}

	getValue(): A {
		return this.#value;
	}

	multicast(): Stream<A> {
		return this;
	}

	map<B>(transform: (val: A) => B): Stream<B> {
		return new StreamMap(this, transform);
	}

	subscribe(f: (val: A) => void): Subscription {
		this.#subscription ??= this.#baseStream.subscribe((val) => {
			for (const sub of this.#subscribers) {
				sub(val);
			}
			this.#value = val;
		});

		const subId = this.#nextSubscriptionId++;
		this.#subscribers.push(f);
		this.#subscriberIds.push(subId);
		return {
			unsubscribe: () => {
				const idx = this.#subscriberIds.indexOf(subId);
				this.#subscribers.splice(idx, 1);
				this.#subscriberIds.splice(idx, 1);
				if (this.#subscriberIds.length === 0) {
					this.#subscription?.unsubscribe();
					this.#subscription = null;
				}
			},
		};
	}
}

export class StreamSource<A> {
	readonly #multicastStream: Stream<A>;
	#subscriber: null | ((val: A) => void) = null;
	#value: A;

	constructor(value: A) {
		this.#value = value;
		this.#multicastStream = new StreamMulticast({
			getValue: () => {
				return this.#value;
			},
			subscribe: (f) => {
				if (this.#subscriber !== null)
					throw new Error("Unexpected 2nd subscription");

				this.#subscriber = f;
				return {
					unsubscribe: () => {
						this.#subscriber = null;
					},
				};
			},
		});
	}

	next(val: A): void {
		if (val === this.#value) return;

		this.#subscriber?.(val);
		this.#value = val;
	}

	stream(): Stream<A> {
		return this.#multicastStream;
	}
}

export function useStream<A>(stream: Stream<A>): A {
	const [state, setState] = useState<A>(stream.getValue());

	useEffect(() => stream.subscribe(setState).unsubscribe, [stream]);

	return state;
}
