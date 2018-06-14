import * as React from "react"
import styled from "styled-components"
import { Rgb } from "../../../data"

export const PrimaryButton = styled.button`
    display: inline-flex;
    outline: none;
    justify-content: center;
    align-items: center;
    position: relative;
    text-decoration: none;
    background-color: var(--color-primary);
    color: var(--color-text-dark);
    border: 0;
    border-radius: 0.25rem;
    height: auto;
    padding: 0.5rem;
    height: 2.25rem;
    width: auto;
    min-width: 4rem;
    transition: background-color 0.15s;
    line-height: 1.4em;
    cursor: pointer;

    &:hover {
        background-color: var(--color-primary-highlight);
    }
`
