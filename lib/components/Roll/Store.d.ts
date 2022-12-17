/// <reference types="react" />
import * as Tone from 'tone';
import { Unit } from "tone";
import { Note } from 'typings/common';
export declare type Status = 'stop' | 'playing';
export declare type Track = {
    instrument: string;
    notes: Note[];
};
export declare type RollState = {
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
    instrument: Record<string, Tone.PolySynth>;
    keyboards: Record<string, React.FC>;
    registInstrument: (name: string, instrument: Tone.PolySynth, component: React.FC) => void;
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
    attackNote: (name: string, note: Note, time?: Unit.Time) => void;
    releaseNote: (name: string, note: Note, time?: Unit.Time) => void;
    setBpm: (value: number) => void;
    trigInstruments: (time: Unit.Time) => void;
}
