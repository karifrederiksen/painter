import * as React from "react"
import styled from "../styled"
import * as Layers from "../layers"
import { Row } from "../components/row"
import { Slider } from "../components/slider"
import { Labeled } from "../components/labeled"
import { InlineLabeled } from "../components/inlineLabeled"
import { Switch } from "../components/switch"
import { DefaultButton } from "../components/buttons"

export interface LayersViewProps {
    readonly layers: Layers.State
    readonly sender: Layers.MsgSender
}

const LayersWrapper = styled.div`
    background-color: ${p => p.theme.colorBg1.toStyle()};
    height: 100%;
    padding: 0.5rem 0;
    color: ${p => p.theme.colorTextLight.toStyle()};
`

const LayersListWrapper = styled.div`
    padding: 0.5rem;

    & > :not(:first-child) {
        margin-top: 0.25rem;
    }
`

const LayersControlsWrapper = styled.div`
    background-color: ${p => p.theme.colorBg2.toStyle()};
    display: flex;
    flex-direction: column;
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
    background-color: ${p => p.theme.colorBg2.toStyle()};
    color: ${p => p.theme.colorTextLight.toStyle()};

    &:hover {
        color: ${p => p.theme.colorTextLightest.toStyle()};
    }
`

const SelectedLayerWrapper = styled(LayerWrapper)`
    background-color: ${p => p.theme.colorBg2.toStyle()};
    color: ${p => p.theme.colorTextLightest.toStyle()};
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
