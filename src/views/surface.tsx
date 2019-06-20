import * as React from "react"
import * as styles from "./surface.scss"

export const surfaceLook = styles.surfaceLook

export function Surface(props: React.ComponentProps<"div">) {
    return <div {...props} className={styles.surface} />
}
