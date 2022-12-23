import { RollStore } from "../Roll/Store";
import { Note } from "typings/common";
export type KeyboardState = {};
export declare const genKeysFnMap: {
    default(notes: Note[]): string[];
    drum(_: any): string[];
};
export declare class KeyboardStore {
    contextStore: RollStore;
    constructor(context: RollStore, initState?: Partial<KeyboardState>);
    keyStatusMap: Record<string, boolean>;
    get noteToKeyMap(): Record<string, string>;
    get keyToNoteMap(): Record<string, string>;
    clearNote: () => void;
    onMouseDown: () => void;
    onMouseEnter: () => void;
    onMouseUp: () => void;
    onKeydown: (event: KeyboardEvent) => void;
    onKeyup: (event: KeyboardEvent) => void;
    unmountKeyboardEvents: () => void;
    mountKeyboardEvent: () => void;
}
