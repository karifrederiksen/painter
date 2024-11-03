export interface InspectionReport {
    readonly args?: (args: readonly unknown[]) => void;
    readonly result?: (result: unknown) => void;
    readonly error?: (err: unknown) => void;
    readonly frequency?: number;
}
export declare function inspectMethod(report?: InspectionReport): MethodDecorator;
