import React from "react";
import { useForm } from "react-hook-form";
import { useStream, type Send, type Stream, type UICanvas } from "~/state";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	width: z.string().refine(canvasSizeCheck, {
		message: canvasSizeFailure("width"),
	}),
	height: z.string().refine(canvasSizeCheck, {
		message: canvasSizeFailure("height"),
	}),
});

function canvasSizeCheck(s: string): boolean {
	const n = Number(s);
	if (Number.isNaN(n)) return false;

	return n > 64 && n < 10_000;
}

function canvasSizeFailure(dimension: string) {
	return `Canvas ${dimension} must be between 64 and 10,000 pixels`;
}

export interface CanvasBuilderProps {
	className?: string;
	canvasBuilderStream: Stream<null | UICanvas>;
	send: Send;
}

export function CanvasBuilder({
	className,
	canvasBuilderStream,
	send,
}: CanvasBuilderProps): React.JSX.Element {
	const canvasBuilder = useStream(canvasBuilderStream);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "Painting",
			width: "800",
			height: "800",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		send("canvas:create", {
			name: data.name,
			width: Number(data.width),
			height: Number(data.height),
		});
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
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="w-2/3 space-y-6"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Mona Lisa" {...field} />
									</FormControl>
									<FormDescription>
										This is the name of the canvas in your library and the name
										of the file when downloaded.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="width"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Width</FormLabel>
									<FormControl>
										<Input placeholder="2400" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="height"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Height</FormLabel>
									<FormControl>
										<Input placeholder="3000" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Create</Button>
					</form>
					<div className=""></div>
				</Form>
			</Card>
		</div>
	);
}
