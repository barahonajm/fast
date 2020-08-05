import { css } from "@microsoft/fast-element";
import { display } from "@microsoft/fast-foundation";
import {
    accentFillRestBehavior,
    neutralDividerRestBehavior,
    neutralForegroundRestBehavior,
} from "../styles/recipes";

export const CarouselStyles = css`
    :host {
        box-sizing: border-box;
        font-family: var(--body-font);
        font-size: var(--type-ramp-minus-1-font-size);
        line-height: var(--type-ramp-minus-1-font-size);
        color: var(--neutral-foreground-rest);
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        height: 100%;
        width: 100%;
        position: relative;
        overflow: auto;
    }

    :host([hidden]) {
        display: none;
    }

    ::slotted(.slide) {
        max-width: 100%;
        max-height: 100%;
    }

    .previous-flipper {
        position: absolute;
        left: 20px;
    }

    .next-flipper {
        position: absolute;
        right: 20px;
    }

    .slide-container {
    }

    .slide-tabs {
        position: absolute;
        bottom: 40px;
    }

    .slide-tab {
        display: inline-block;
        padding: 4px;
        border-radius: 40px;
        border: none;
        outline: none;
    }

    .slide-tab:before {
        opacity: 0.5;
        width: 32px;
        border: 1px solid #bebebe;
        border-radius: 40px;
        opacity: 0.45;
        content: " ";
        display: block;
        transition: all 0.05s ease-in-out;
        height: 4px;
        background-color: #101010;
    }

    .slide-tab[aria-selected="true"]:before {
        opacity: 1;
    }

    .slide-tab:hover:before {
        border-color: #fff;
    }

    .play-control {
        position: absolute;
        left: 10px;
        top: 10px;
    }

    ${/*TODO: GET THIS TAB SELECTOR WORKING*/ ""};

    fast-tabs::part(tab) {
        color: red;
        outline: 1px dotted green;
    }

    fast-tabs::part(tablist) {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }

    fast-tabs::part(tabpanelcontainer) {
    }
`.withBehaviors(
    accentFillRestBehavior,
    neutralDividerRestBehavior,
    neutralForegroundRestBehavior
);
