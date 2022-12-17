import { Note } from 'typings/common';
export declare const OCTIVE_NAMES: string[];
export declare const normalizeName: (name: string) => string | undefined;
export declare const getNoteWithOctive: (name: string, octive: number) => string;
export declare const getFullNoteStr: (noteStr: string) => string;
export declare const sortNotes: (noteArr: Note[]) => Note[];
export declare const normalizeNote: (noteArr: Note[]) => {
    time: number | undefined;
    value: string;
}[];
export declare const separateNoteStr: (noteStr: string) => {
    octive: string;
    name: string;
};
export declare const composeNoteStr: (name: string, octive: string) => string;
export declare const genKeys: (notes: Note[]) => string[];
