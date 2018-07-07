import * as Inferno from "inferno"
import { css } from "emotion"
import { LayerState, Layer } from "../../canvas/layers"
import { LayerView } from "./layer"

export interface LayersProps {
    readonly layers: LayerState
}

const layersWrapper = css`
    background-color: var(--color-bg-level-0);
    color: var(--color-text-light);
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
`

export function Layers(props: LayersProps): JSX.Element {
    const topLayers = props.layers.layers.children
    const selectedId = props.layers.current().id
    return (
        <div className={layersWrapper}>
            {topLayers.map(x => <LayerView layer={x} selectedId={selectedId} key={x.id} />)}
        </div>
    )
}
