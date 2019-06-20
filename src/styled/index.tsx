import * as React from "react"
import { Theme, updateAll, updateDiff } from "../theme"

export function ThemeProvider(props: { readonly theme: Theme }): JSX.Element {
    const [prevTheme, setPrevTheme] = React.useState<Theme | null>(null)

    React.useLayoutEffect(() => {
        if (prevTheme === null) {
            updateAll(props.theme)
        } else {
            updateDiff(prevTheme, props.theme)
        }
        setPrevTheme(props.theme)
    }, [props.theme])

    return <></>
}

export const Rem = 16
