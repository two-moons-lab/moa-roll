/// <reference types="react" />
import * as Tone from "tone";
import { Unit } from "tone";
import { Note, NoteOnlyValue } from "typings/common";
import { BaseInstrument } from "../instruments/base";
export type Status = "stop" | "playing";
export type Track = {
    instrument: string;
    notes: Note[];
    range?: [string, string];
};
export type RollState = {
    length: number;
    currentTrack: string;
    keyboardOctive: number;
    step: number;
    range: [string, string];
    timeLength: number | undefined;
    tracks: Track[];
    activeKeys: Record<string, string[]>;
    bpm: number;
    status: Status;
    timeSignature: [number, number];
    keyboards: Record<string, React.FC>;
    instrument: Record<string, Tone.Synth>;
};
export declare class RollStore {
    currentTrack: string;
    step: number;
    keyboardOctive: number;
    timeLength: undefined;
    status: Status;
    tracks: Track[];
    bpm: number;
    activeKeys: Record<string, string[]>;
    instrument: Record<string, BaseInstrument>;
    keyboards: Record<string, React.FC>;
    events: Record<string, Function | undefined>;
    registInstrument: (name: string, instrument: BaseInstrument, component: React.FC) => void;
    constructor(initialState: Partial<RollState> | undefined);
    changeTrack: (instrument: string) => void;
    setData: (initialState: Partial<RollState> | undefined) => void;
    setKeyboardOctive: (value: number) => void;
    init: () => void;
    get defaultTimeLength(): number;
    get keyboardLength(): number;
    start: () => void;
    play: () => void;
    stop: () => void;
    trigNote: (name: string, note: Note, time: Unit.Time) => void;
    attackNote: (name: string, note: NoteOnlyValue, time?: Unit.Time) => void;
    releaseNote: (name: string, note: NoteOnlyValue, time?: Unit.Time) => void;
    setBpm: (value: number) => void;
    trigInstruments: (time: Unit.Time) => void;
}
