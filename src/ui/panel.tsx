import type React from "react";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export interface PanelProps {
	children: React.ReactNode;
	className?: string;
}

export function Panel({ children, className }: PanelProps): React.JSX.Element {
	return (
		<Card
			className={cn("min-w-[200px] flex flex-col gap-4 py-4 px-2", className)}
		>
			{children}
		</Card>
	);
}
