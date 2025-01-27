import { PITCH_MOD } from "typings/common";
export declare const OCTIVE_NAMES: string[];
export declare const normalizeName: (name: string) => string | undefined;
export declare const getNoteWithOctive: (name: string, octive: number) => string;
export declare const getFullNoteStr: (noteStr: string) => string;
export declare const sortNoteValues: (noteValues: string[]) => string[];
export declare const normalizeNoteValues: (noteValues: string[]) => string[];
export declare const separateNoteStr: (noteStr: string) => {
    octive: string;
    name: string;
};
export declare const composeNoteStr: (name: string, octive: string) => string;
export declare const genKeys: (noteValues: string[], range?: string[], mod?: PITCH_MOD) => string[];
export declare function compareNoteStr(note1: string, note2: string): number;
