import { RollStore } from "../../Roll/Store";
import { Note } from "typings/common";
export type KeyboardState = {};
export declare const genKeysFnMap: {
    default(noteValues: string[], range?: string[]): string[];
    drum(): string[];
};
export declare class KeyboardStore {
    contextStore: RollStore;
    instrument: string;
    constructor(context: RollStore, instrument: string);
    keyStatusMap: Record<string, boolean>;
    get noteToKeyMap(): Record<string, string>;
    get keyToNoteMap(): Record<string, string>;
    writeState: {
        startNote: Note | undefined;
    };
    clearExistNote: (note: Note) => Note[] | undefined;
    setStartNote: (note: Note) => void;
    setEndNote: (note: Note) => void;
    onMouseEnter: (note: Note) => void;
    onKeydown: (event: KeyboardEvent) => void;
    onKeyup: (event: KeyboardEvent) => void;
    unmountKeyboardEvents: () => void;
    mountKeyboardEvent: () => void;
}
