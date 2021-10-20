import { Op, Events, onClick, _, shallowEqual, statelessComponent } from "ivi"
import { div, span } from "ivi-html"
import styles from "./layers.scss"
import { State, Sender, Id, Layer } from "../../canvas/layers"
import { Row, DefaultButton, Surface, LabeledSlider, LabeledSwitch } from "../components"
import { stringToFloat } from "../../util"

export interface LayersViewProps {
    readonly layers: State
    readonly sender: Sender
}

function toFixed2(n: number): string {
    return n.toFixed(2)
}

export const LayersView = statelessComponent<LayersViewProps>(({ layers, sender }) => {
    const topLayers = layers.layers.children
    const current = layers.current()

    return div(styles.layersWrapper, _, [
        Surface(
            div(styles.layersControlsWrapper, _, [
                Row({
                    spacing: "0.25rem",
                    children: [
                        DefaultButton({
                            onClick: () => sender.newLayer(current.id),
                            title: "New layer",
                            content: "New",
                        }),
                        DefaultButton({
                            onClick: () => sender.removeLayer(current.id),
                            title: "Delete layer",
                            content: "Delete",
                        }),
                    ],
                }),
                LabeledSwitch({
                    label: "Hidden",
                    checked: current.isHidden,
                    onCheck: (isHidden) => sender.setHidden(current.id, isHidden),
                }),
                LabeledSlider({
                    label: "Opacity",
                    value: current.opacity,
                    toString: toFixed2,
                    fromString: stringToFloat,
                    percentage: current.opacity,
                    onChange: (pct) => sender.setOpacity(current.id, pct),
                }),
            ])
        ),
        div(
            styles.layersListWrapper,
            _,
            topLayers.map((layer) =>
                LayerView({
                    layer,
                    selectedId: current.id,
                    onClick: (id) => sender.selectLayer(id),
                })
            )
        ),
    ])
}, shallowEqual)

interface LayerViewProps {
    readonly selectedId: Id
    readonly layer: Layer
    readonly onClick: (id: Id) => void
}

function LayerView(props: LayerViewProps): Op {
    const { selectedId, layer } = props
    const isSelected = selectedId === layer.id
    const container = isSelected ? styles.selectedLayerWrapper : styles.unselectedLayerWrapper

    return Events(
        onClick(() => props.onClick(layer.id)),
        div(
            container,
            _,
            Surface([
                div(styles.layerLeft),
                div(styles.layerRight, _, [
                    div(styles.layerName, _, layer.name !== "" ? layer.name : "Layer " + layer.id),
                    div(
                        styles.layerOpacity,
                        _,
                        layer.isHidden
                            ? "Hidden"
                            : span(_, _, [
                                  span(_, _, "Opacity: "),
                                  span(_, _, layer.opacity.toFixed(2)),
                              ])
                    ),
                ]),
            ])
        )
    )
}
