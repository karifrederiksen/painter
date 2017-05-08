

// Not a good idea to start using actions before the code base has stabilized.
export interface Action {
	do(): void;
	undo(): void;
}


