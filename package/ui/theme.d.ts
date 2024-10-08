import * as Color from "color";
import { Generators as Gen } from "../rng/index.js";
export interface Theme {
    readonly color: {
        readonly primary: Color.Hsluv;
        readonly primaryLight: Color.Hsluv;
        readonly primaryDark: Color.Hsluv;
        readonly secondary: Color.Hsluv;
        readonly secondaryLight: Color.Hsluv;
        readonly secondaryDark: Color.Hsluv;
        readonly onPrimary: Color.Hsluv;
        readonly onSecondary: Color.Hsluv;
        readonly onSurface: Color.Hsluv;
        readonly surface: Color.Hsluv;
        readonly background: Color.Hsluv;
    };
    readonly shadows: {
        readonly button: string;
        readonly surface: string;
        readonly menu: string;
    };
    readonly fonts: {
        readonly monospace: string;
        readonly normal: string;
    };
}
export declare function updateDiff(node: HTMLElement, prevTheme: Theme, nextTheme: Theme): void;
export declare function updateAll(node: HTMLElement, theme: Theme): void;
export declare function createDeclarations(theme: Theme): string;
export declare const random: Gen.Generators<Theme>;
