import * as React from "react"
import styled from "../styled"
import * as Layers from "../layers"
import { Row } from "../components/row"
import { Slider } from "../components/slider"
import { Labeled } from "../components/labeled"
import { InlineLabeled } from "../components/inlineLabeled"
import { Switch } from "../components/switch"
import { DefaultButton } from "../components/buttons"
import { Surface } from "../components/surface"

export interface LayersViewProps {
    readonly layers: Layers.State
    readonly sender: Layers.MsgSender
}

const LayersWrapper = styled.div`
    height: 100%;
`

const LayersListWrapper = styled.div`
    padding: 0.5rem 0.25rem;

    & > :not(:first-child) {
        margin-top: 0.25rem;
    }
`

const LayersControlsWrapper = styled(Surface)`
    justify-content: space-between;
    flex-direction: column;
    padding-top: 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
`

export function LayersView({ layers, sender }: LayersViewProps): JSX.Element {
    const topLayers = layers.layers.children
    const current = layers.current()

    return (
        <LayersWrapper>
            <LayersControlsWrapper>
                <Row spacing="0.25rem">
                    <DefaultButton onClick={() => sender.newLayer(current.id)} title="New layer">
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
            </LayersControlsWrapper>
            <LayersListWrapper>
                {topLayers.map(x => (
                    <LayerView
                        layer={x}
                        onClick={id => sender.selectLayer(id)}
                        selectedId={current.id}
                        key={x.id}
                    />
                ))}
            </LayersListWrapper>
        </LayersWrapper>
    )
}

export interface LayerViewProps {
    readonly selectedId: Layers.Id
    readonly layer: Layers.Layer
    readonly onClick: (id: Layers.Id) => void
}

const UnselectedLayerWrapper = styled(Surface)`
    cursor: pointer;
    border: 1px solid transparent;

    &:hover {
        border: 1px solid ${p => p.theme.color.secondaryDark.toStyle()};
    }
`

const SelectedLayerWrapper = styled(Surface)`
    border: 1px solid ${p => p.theme.color.secondary.toStyle()};
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
