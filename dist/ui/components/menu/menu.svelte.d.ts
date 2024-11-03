import { SvelteComponent } from "svelte";
import type { ZipperList } from "../../../collections/zipperList.js";
declare class __sveltets_Render<a> {
    props(): {
        choices: ZipperList<a>;
        show: (val: a) => string;
    };
    events(): {
        select: CustomEvent<a>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}
export type MenuProps<a> = ReturnType<__sveltets_Render<a>['props']>;
export type MenuEvents<a> = ReturnType<__sveltets_Render<a>['events']>;
export type MenuSlots<a> = ReturnType<__sveltets_Render<a>['slots']>;
export default class Menu<a> extends SvelteComponent<MenuProps<a>, MenuEvents<a>, MenuSlots<a>> {
}
export {};
