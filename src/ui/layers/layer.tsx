import { css } from "emotion"
import { Layer, LayerState, LayerId } from "../../canvas/layers"

export interface LayerViewProps {
    readonly selectedId: LayerId
    readonly layer: Layer
}

const layerWrapper = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: var(--color-bg-level-1);
    width: 100%;
`

const layerLeft = css`
    height: 3rem;
    width: 3rem;
    margin-right: 0.5rem;
    background-color: #789;
`
const layerRight = css`
    display: flex;
    flex-direction: column;
    margin-right: 0.5rem;
`

const layerName = css`
    font-size: 1.25rem;
`

const layerOpacity = css`
    font-size: 0.75rem;
`

export function LayerView({ layer }: LayerViewProps): JSX.Element {
    return (
        <div className={layerWrapper}>
            <div className={layerLeft} />
            <div className={layerRight}>
                <div className={layerName}>
                    {layer.name !== "" ? layer.name : "Layer " + layer.id}
                </div>
                <div className={layerOpacity}>
                    Opacity: <span>{layer.opacity.toFixed(2)}</span>
                </div>
            </div>
        </div>
    )
}
