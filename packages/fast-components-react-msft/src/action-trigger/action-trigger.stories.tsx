import { storiesOf } from "@storybook/react";
import React, { useState } from "react";
import { ActionTrigger, ActionTriggerAppearance } from "./";
import { glyphFactory, SVGGlyph } from "../../assets/svg-element";
import { action } from "@storybook/addon-actions";
import { SettingsIcon } from "@edge-web-ui/edge-icons";

function glyphExample(glyph: JSX.Element): (className?: string) => React.ReactNode {
    return (className?: string): React.ReactNode => {
        return React.cloneElement(glyph, { className });
    };
}

storiesOf("Action trigger", module)
    .add("Default", () => (
        <ActionTrigger glyph={glyphExample(<SettingsIcon />)} onClick={action("onClick")}>
            Download
        </ActionTrigger>
    ))
    .add("Icon only", () => (
        <ActionTrigger
            glyph={glyphFactory(SVGGlyph.download)}
            onClick={action("onClick")}
        />
    ))
    .add("Justified", () => (
        <ActionTrigger
            glyph={glyphFactory(SVGGlyph.download)}
            appearance={ActionTriggerAppearance.justified}
            onClick={action("onClick")}
        >
            Download
        </ActionTrigger>
    ))
    .add("Lightweight", () => (
        <ActionTrigger
            glyph={glyphFactory(SVGGlyph.download)}
            appearance={ActionTriggerAppearance.lightweight}
            onClick={action("onClick")}
        >
            Download
        </ActionTrigger>
    ))
    .add("Outline", () => (
        <ActionTrigger
            glyph={glyphFactory(SVGGlyph.download)}
            appearance={ActionTriggerAppearance.outline}
            onClick={action("onClick")}
        >
            Download
        </ActionTrigger>
    ))
    .add("Primary", () => (
        <ActionTrigger
            glyph={glyphFactory(SVGGlyph.download)}
            appearance={ActionTriggerAppearance.primary}
            onClick={action("onClick")}
        >
            Download
        </ActionTrigger>
    ))
    .add("Stealth", () => (
        <ActionTrigger
            glyph={glyphFactory(SVGGlyph.download)}
            appearance={ActionTriggerAppearance.stealth}
            onClick={action("onClick")}
        >
            Download
        </ActionTrigger>
    ));
