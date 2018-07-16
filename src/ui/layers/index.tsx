import { css } from "emotion"
import { LayerState, LayerMessageSender } from "canvas/layers"
import { LayerView } from "./layer"
import { DefaultButton } from "ui/views/buttons/filledButton"
import { Row } from "ui/views/row"
import { Slider } from "ui/views/slider"
import { Labeled } from "ui/views/labeled"
import { InlineLabeled } from "ui/views/inlineLabeled"
import { Switch } from "ui/views/switch"
import { CSS_COLOR_TEXT_LIGHT, CSS_COLOR_BG_LEVEL_1, CSS_COLOR_BG_LEVEL_0 } from "ui/css"

export interface LayersProps {
    readonly layers: LayerState
    readonly sender: LayerMessageSender
}

const layersWrapper = css`
    background-color: ${CSS_COLOR_BG_LEVEL_0};
    height: 100%;
    padding: 0.5rem 0;
    color: ${CSS_COLOR_TEXT_LIGHT};
`

const layersListWrapper = css`
    padding: 0.5rem;

    & > :not(:first-child) {
        margin-top: 0.25rem;
    }
`

const layersControlsWrapper = css`
    background-color: ${CSS_COLOR_BG_LEVEL_1};
    display: flex;
    flex-direction: column;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
`

export function Layers({ layers, sender }: LayersProps): JSX.Element {
    const topLayers = layers.layers.children
    const current = layers.current()

    return (
        <div className={layersWrapper}>
            <div className={layersControlsWrapper}>
                <Row spacing="0.25rem">
                    <DefaultButton onClick={() => sender.newLayer(current.id)} tooltip="New layer">
                        New
                    </DefaultButton>
                    <DefaultButton
                        onClick={() => sender.removeLayer(current.id)}
                        tooltip="Remove layer"
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
            <div className={layersListWrapper}>
                {topLayers.map(x => (
                    <div>
                        <LayerView
                            layer={x}
                            onClick={id => sender.selectLayer(id)}
                            selectedId={current.id}
                            key={x.id}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
