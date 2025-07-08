import React, { type FormEvent } from "react";
import { useStream, type Send, type Stream } from "~/state";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { CanvasBuilder, DoCanvasBuilderThings } from "~/state/canvas";

export interface CanvasBuilderProps {
	className?: string;
	canvasBuilderStream: Stream<null | CanvasBuilder>;
	send: Send<DoCanvasBuilderThings>;
}

export function CanvasBuilder({
	className,
	canvasBuilderStream,
	send,
}: CanvasBuilderProps): React.JSX.Element {
	const canvasBuilder = useStream(canvasBuilderStream);

	function onSubmit(ev: FormEvent) {
		ev.preventDefault();
		send("canvas:create");
	}

	if (canvasBuilder === null) return <></>;
	return (
		<div
			className={cn(
				"absolute left-0 right-0 top-0 bottom-0 pointer-none flex items-center justify-center",
				className,
			)}
		>
			<div className="-z-10 absolute left-0 right-0 top-0 bottom-0 bg-accent opacity-85"></div>
			<Card className="p-4">
				<form onSubmit={onSubmit} className="w-2/3 space-y-6">
					<div>
						<label htmlFor="name">Name</label>
						<Input
							id="name"
							placeholder="Mona Lisa"
							value={canvasBuilder.name}
							onInput={(ev) => send("canvas:setName", ev.currentTarget.value)}
						/>
						<div>
							This is the name of the canvas in your library and the name of the
							file when downloaded.
						</div>
						{canvasBuilder.nameValidation && (
							<div className="text-destructive">
								{canvasBuilder.nameValidation}
							</div>
						)}
					</div>
					<div>
						<label htmlFor="width">Width</label>
						<Input
							id="width"
							placeholder="1920"
							value={canvasBuilder.width}
							onInput={(ev) => send("canvas:setWidth", ev.currentTarget.value)}
						/>
						{canvasBuilder.widthValidation && (
							<div className="text-destructive">
								{canvasBuilder.widthValidation}
							</div>
						)}
					</div>
					<div>
						<label htmlFor="height">Height</label>
						<Input
							id="height"
							placeholder="1080"
							value={canvasBuilder.height}
							onInput={(ev) => send("canvas:setHeight", ev.currentTarget.value)}
						/>
						{canvasBuilder.heightValidation && (
							<div className="text-destructive">
								{canvasBuilder.heightValidation}
							</div>
						)}
					</div>
					<Button type="submit">Create</Button>
				</form>
			</Card>
		</div>
	);
}
