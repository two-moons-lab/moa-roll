import React from "react";
import { RollState, RollStore } from "./Store";
export declare const RollContext: React.Context<RollStore>;
type RollProps = {
    height?: number;
    data?: Partial<RollState>;
    showController?: boolean;
    modelRef?: React.MutableRefObject<ModelRef> | ((ref: ModelRef) => void);
    onPlayEnd?: () => void;
};
export type ModelRef = {
    play: () => void;
    stop: () => void;
    start: () => void;
    setData: (data: Partial<RollState>) => void;
};
export declare class Roll extends React.Component<RollProps> {
    store: RollStore;
    constructor(props: RollProps);
    render(): JSX.Element;
}
export {};
