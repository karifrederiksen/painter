import * as React from "react"
import styles from "./view.scss"
import { State, MsgSender, Id, Layer } from "./model"
import { Row } from "../views/row"
import { Slider } from "../views/slider"
import { Labeled } from "../views/labeled"
import { InlineLabeled } from "../views/inlineLabeled"
import { Switch } from "../views/switch"
import { DefaultButton } from "../views/buttons"
import { Surface } from "../views/surface"

export interface LayersViewProps {
    readonly layers: State
    readonly sender: MsgSender
}

export function LayersView({ layers, sender }: LayersViewProps): JSX.Element {
    const topLayers = layers.layers.children
    const current = layers.current()

    return (
        <div className={styles.layersWrapper}>
            <Surface>
                <div className={styles.layersControlsWrapper}>
                    <Row spacing="0.25rem">
                        <DefaultButton
                            onClick={() => sender.newLayer(current.id)}
                            title="New layer"
                        >
                            New
                        </DefaultButton>
                        <DefaultButton
                            onClick={() => sender.removeLayer(current.id)}
                            title="Remove layer"
                        >
                            Delete
                        </DefaultButton>
                    </Row>
                    <InlineLabeled label="Hidden">
                        <Switch
                            onCheck={isHidden => sender.setHidden(current.id, isHidden)}
                            checked={current.isHidden}
                        />
                    </InlineLabeled>
                    <Labeled label="Opacity" value={current.opacity.toFixed(2)}>
                        <Slider
                            onChange={pct => sender.setOpacity(current.id, pct)}
                            percentage={current.opacity}
                        />
                    </Labeled>
                </div>
            </Surface>
            <div className={styles.layersListWrapper}>
                {topLayers.map(x => (
                    <LayerView
                        layer={x}
                        onClick={id => sender.selectLayer(id)}
                        selectedId={current.id}
                        key={x.id}
                    />
                ))}
            </div>
        </div>
    )
}

export interface LayerViewProps {
    readonly selectedId: Id
    readonly layer: Layer
    readonly onClick: (id: Id) => void
}

export function LayerView({ layer, selectedId, onClick }: LayerViewProps): JSX.Element {
    const isSelected = selectedId === layer.id
    const container = isSelected ? styles.selectedLayerWrapper : styles.unselectedLayerWrapper
    return (
        <div className={container} onClick={() => onClick(layer.id)}>
            <Surface>
                <div className={styles.layerLeft} />
                <div className={styles.layerRight}>
                    <div className={styles.layerName}>
                        {layer.name !== "" ? layer.name : "Layer " + layer.id}
                    </div>
                    <div className={styles.layerOpacity}>
                        {layer.isHidden ? (
                            <span>Hidden</span>
                        ) : (
                            <span>
                                <span>Opacity: </span>
                                <span>{layer.opacity.toFixed(2)} </span>
                            </span>
                        )}
                    </div>
                </div>
            </Surface>
        </div>
    )
}
