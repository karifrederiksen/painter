import { css } from "emotion"
import { Layer, LayerId } from "canvas/layers"
import {
    CSS_COLOR_TEXT_DARK,
    CSS_COLOR_TEXT_LIGHT,
    CSS_COLOR_BG_LEVEL_1,
    CSS_COLOR_DEFAULT_HIGHLIGHT,
    CSS_COLOR_DEFAULT,
    CSS_COLOR_TEXT_LIGHTEST,
} from "ui/css"

export interface LayerViewProps {
    readonly selectedId: LayerId
    readonly layer: Layer
    readonly onClick: (id: LayerId) => void
}

const layerWrapper = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    user-select: none;
    transition: all 150ms;
`

const unselectedLayerWrapper = css`
    cursor: pointer;
    background-color: ${CSS_COLOR_BG_LEVEL_1};
    color: ${CSS_COLOR_TEXT_LIGHT};

    &:hover {
        color: ${CSS_COLOR_TEXT_LIGHTEST};
    }
`

const selectedLayerWrapper = css`
    background-color: ${CSS_COLOR_BG_LEVEL_1};
    color: ${CSS_COLOR_TEXT_LIGHTEST};
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 4px 2px 0 rgba(0, 0, 0, 0.14),
        0 6px 1px -2px rgba(0, 0, 0, 0.12);
    margin-left: -0.5rem;
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
    font-size: 1rem;
`

const layerOpacity = css`
    font-size: 0.75rem;
`

export function LayerView({ layer, selectedId, onClick }: LayerViewProps): JSX.Element {
    const isSelected = selectedId === layer.id
    return (
        <div
            className={`${layerWrapper} ${
                isSelected ? selectedLayerWrapper : unselectedLayerWrapper
            }`}
            onclick={() => onClick(layer.id)}
        >
            <div className={layerLeft} />
            <div className={layerRight}>
                <div className={layerName}>
                    {layer.name !== "" ? layer.name : "Layer " + layer.id}
                </div>
                {layer.isHidden ? (
                    <div className={layerOpacity}>
                        <span>Hidden</span>
                    </div>
                ) : (
                    <div className={layerOpacity}>
                        <span>Opacity: </span>
                        <span>{layer.opacity.toFixed(2)} </span>
                    </div>
                )}
            </div>
        </div>
    )
}
