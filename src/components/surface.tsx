import * as React from "react"
import styled from "../styled"

export const SurfaceLook = styled.div`
    background-color: ${p => p.theme.color.surface.toStyle()};
    color: ${p => p.theme.color.onSurface.toStyle()};
    box-shadow: ${p => p.theme.shadows.surface};
`

export const Surface = styled(SurfaceLook)`
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    user-select: none;
`
