import { RollStore } from '../Roll/Store';
export declare type KeyboardState = {};
export declare class KeyboardStore {
    contextStore: RollStore;
    constructor(context: RollStore, initState?: Partial<KeyboardState>);
    keyStatusMap: Record<string, boolean>;
    get noteToKeyMap(): Record<string, string>;
    get keyToNoteMap(): Record<string, string>;
    onKeydown: (event: KeyboardEvent) => void;
    onKeyup: (event: KeyboardEvent) => void;
    unmountKeyboardEvents: () => void;
    mountKeyboardEvent: () => void;
}
