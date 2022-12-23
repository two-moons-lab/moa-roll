import React from "react";
export interface ContainerProviderProps<State = void> {
    initialState?: State;
    children: React.ReactNode;
}
export type Container<Value, State = void> = [
    () => Value,
    React.ComponentType<ContainerProviderProps<State>>
];
export declare function createContainer<Value, State = void>(useHook: (initialState?: State) => Value): Container<Value, State>;
