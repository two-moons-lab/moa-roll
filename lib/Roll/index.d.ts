import React from "react";
import { RollState, RollStore } from "./Store";
export declare const RollContext: React.Context<RollStore>;
type RollProps = {
    data?: Partial<RollState>;
    showController?: boolean;
    squash?: boolean;
    modelRef?: React.MutableRefObject<ModelRef> | ((ref: ModelRef) => void);
    onPlayEnd?: () => void;
    onChange?: (data: Partial<RollState>) => void;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type RollData = Partial<RollState>;
export type ModelRef = {
    play: () => void;
    stop: () => void;
    start: () => void;
    getData: () => RollData;
    setData: (data: RollData) => void;
};
export declare class Roll extends React.Component<RollProps> {
    store: RollStore;
    static defaultProps: {
        width: number;
    };
    constructor(props: RollProps);
    render(): React.JSX.Element;
}
export {};
