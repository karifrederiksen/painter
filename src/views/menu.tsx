import * as React from "react"
import * as styles from "./menu.scss"
import { ZipperList } from "../collections/zipperList"

export interface Props<a> {
    readonly choices: ZipperList<a>
    readonly show: (val: a) => string
    readonly onSelect: (val: a) => void
}

const Menu_ = React.memo(function<a>(props: Props<a>) {
    const { choices, show } = props
    const container = React.useRef<HTMLDivElement | null>(null)
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [listeningToGlobal, setListeningToGlobal] = React.useState(false)

    function onGlobalClick(ev: MouseEvent) {
        let target = ev.target as HTMLElement
        while (target.parentElement !== null) {
            if (target === container.current) {
                return
            }

            target = target.parentElement
        }
        closeMenu()
    }

    function closeAndCallback(val: a) {
        closeMenu()
        props.onSelect(val)
    }

    function openMenu() {
        setIsExpanded(true)
    }

    function closeMenu() {
        setIsExpanded(false)
    }

    React.useEffect(() => {
        if (isExpanded && !listeningToGlobal) {
            document.body.addEventListener("mousedown", onGlobalClick, {
                passive: true,
            })
            setListeningToGlobal(true)
            return () => {
                document.body.removeEventListener("mousedown", onGlobalClick)
            }
        }
        if (listeningToGlobal) {
            setListeningToGlobal(false)
        }
        return () => {}
    }, [isExpanded, listeningToGlobal])

    return (
        <div className={styles.container} onBlur={closeMenu} ref={container}>
            {isExpanded ? (
                <>
                    <div className={styles.selectedDisplayExpanded} onMouseDown={closeMenu}>
                        {show(choices.focus)}
                    </div>
                    <div
                        className={styles.selectableOptions}
                        style={{
                            marginTop:
                                "calc(-0.5rem - " +
                                container.current!.getBoundingClientRect().height +
                                "px)",
                        }}
                    >
                        {choices.getLeft().map(value => (
                            <div
                                className={styles.optionDefault}
                                key={show(value)}
                                onClick={() => closeAndCallback(value)}
                            >
                                {show(value)}
                            </div>
                        ))}
                        <div
                            className={styles.optionSelected}
                            key={show(choices.focus)}
                            onClick={closeMenu}
                        >
                            {show(choices.focus)}
                        </div>
                        {choices.getRight().map(value => (
                            <div
                                className={styles.optionDefault}
                                key={show(value)}
                                onClick={() => closeAndCallback(value)}
                            >
                                {show(value)}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.selectedDisplay} onMouseDown={openMenu}>
                    {show(choices.focus)}
                </div>
            )}
        </div>
    )
})

export function Menu<a>(props: Props<a>) {
    return React.createElement(Menu_, props as any, [])
}
