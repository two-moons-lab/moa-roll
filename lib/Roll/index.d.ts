import React from "react";
import { RollState, RollStore } from "./Store";
export declare const RollContext: React.Context<RollStore>;
type RollProps = {
    data?: Partial<RollState>;
    showController?: boolean;
    controllers: {
        octive?: boolean;
        length?: boolean;
        clear?: boolean;
        bpm?: boolean;
    };
    keyboardPiano?: boolean;
    width?: number;
    squash?: boolean;
    modelRef?: React.MutableRefObject<ModelRef> | ((ref: ModelRef) => void);
    onPlayEnd?: () => void;
    onDataChange?: (data: Partial<RollState>) => void;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type RollData = Partial<RollState>;
export type ModelRef = {
    play: () => void;
    stop: () => void;
    start: () => void;
    getData: () => RollData;
    setData: (data: RollData) => void;
};
export type _RollProps = RollProps & {
    storeRef: React.RefObject<RollStore>;
};
export declare const Roll: {
    new (props: RollProps | Readonly<RollProps>): {
        storeRef: React.RefObject<RollStore>;
        shouldComponentUpdate(nextProps: Readonly<RollProps>): boolean;
        render(): React.JSX.Element;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<RollProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<RollProps> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<RollProps>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<RollProps>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<RollProps>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<RollProps>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<RollProps>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<RollProps>, nextState: Readonly<{}>, nextContext: any): void;
    };
    new (props: RollProps, context: any): {
        storeRef: React.RefObject<RollStore>;
        shouldComponentUpdate(nextProps: Readonly<RollProps>): boolean;
        render(): React.JSX.Element;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<RollProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<RollProps> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<RollProps>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<RollProps>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<RollProps>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<RollProps>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<RollProps>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<RollProps>, nextState: Readonly<{}>, nextContext: any): void;
    };
    contextType?: React.Context<any> | undefined;
};
export {};
