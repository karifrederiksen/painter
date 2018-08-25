import * as React from "react"
import styled from "styled-components"
import { Layer, LayerId } from "canvas/layers"
import { CSS_COLOR_TEXT_LIGHT, CSS_COLOR_BG_LEVEL_1, CSS_COLOR_TEXT_LIGHTEST } from "ui/css"

export interface LayerViewProps {
    readonly selectedId: LayerId
    readonly layer: Layer
    readonly onClick: (id: LayerId) => void
}

const LayerWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    user-select: none;
    transition: all 150ms;
`

const UnselectedLayerWrapper = styled(LayerWrapper)`
    cursor: pointer;
    background-color: ${CSS_COLOR_BG_LEVEL_1};
    color: ${CSS_COLOR_TEXT_LIGHT};

    &:hover {
        color: ${CSS_COLOR_TEXT_LIGHTEST};
    }
`

const SelectedLayerWrapper = styled(LayerWrapper)`
    background-color: ${CSS_COLOR_BG_LEVEL_1};
    color: ${CSS_COLOR_TEXT_LIGHTEST};
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 4px 2px 0 rgba(0, 0, 0, 0.14),
        0 6px 1px -2px rgba(0, 0, 0, 0.12);
    margin-left: -0.25rem;
`

const LayerLeft = styled.div`
    height: 3rem;
    width: 3rem;
    margin-right: 0.5rem;
    background-color: #789;
`
const LayerRight = styled.div`
    display: flex;
    flex-direction: column;
    margin-right: 0.5rem;
`

const LayerName = styled.div`
    font-size: 1rem;
`

const LayerOpacity = styled.div`
    font-size: 0.75rem;
`

export function LayerView({ layer, selectedId, onClick }: LayerViewProps): JSX.Element {
    const isSelected = selectedId === layer.id
    const Container = isSelected ? SelectedLayerWrapper : UnselectedLayerWrapper
    return (
        <Container onClick={() => onClick(layer.id)}>
            <LayerLeft />
            <LayerRight>
                <LayerName>{layer.name !== "" ? layer.name : "Layer " + layer.id}</LayerName>
                <LayerOpacity>
                    {layer.isHidden ? (
                        <span>Hidden</span>
                    ) : (
                        <span>
                            <span>Opacity: </span>
                            <span>{layer.opacity.toFixed(2)} </span>
                        </span>
                    )}
                </LayerOpacity>
            </LayerRight>
        </Container>
    )
}
