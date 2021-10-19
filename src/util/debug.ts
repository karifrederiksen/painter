export interface InspectionReport {
    readonly args?: (args: readonly unknown[]) => void
    readonly result?: (result: unknown) => void
    readonly error?: (err: unknown) => void
    readonly frequency?: number
}

const defaultInspectArgs: InspectionReport = {
    args(args) {
        console.debug("Args: ", args)
    },
    result(result) {
        console.debug("Result: ", result)
    },
    error(err) {
        console.debug("Error: ", err)
    },
}

export function inspectMethod(report?: InspectionReport): MethodDecorator {
    const report_ = report || defaultInspectArgs
    const frequency = report_.frequency || 1
    let callCount = 0
    return (target, key, descriptor) => {
        const original = descriptor.value

        if (typeof original === "function") {
            const originalF = original
            function intercepter(this: unknown, ...args: unknown[]) {
                const shouldOutput = callCount % frequency === 0
                callCount += 1
                if (report_.args && shouldOutput) {
                    report_.args(args)
                }
                try {
                    const result = originalF.apply(this, args)
                    if (report_.result && shouldOutput) {
                        report_.result(result)
                    }
                    return result
                } catch (err) {
                    if (report_.error && shouldOutput) {
                        report_.error(err)
                    }
                    throw err
                }
            }
            descriptor.value = intercepter as any
        }
        return descriptor
    }
}
