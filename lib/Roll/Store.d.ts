/// <reference types="react" />
import { IReactionDisposer } from "mobx";
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
export interface RollState {
    currentTrack: string;
    keyboardOctive: number;
    step: number;
    timeLength: number | undefined;
    tracks: Track[];
    activeKeys: Record<string, string[]>;
    bpm: number;
    status: Status;
    squash: boolean;
    height?: number;
    width?: number;
    scale?: {
        root: string;
        type: string;
    };
    keyboards: Record<string, React.FC>;
    instrument: Record<string, Tone.Synth>;
}
export declare class RollStore implements RollState {
    observeDisposer: IReactionDisposer;
    squash: boolean;
    scale: RollState["scale"];
    height: number;
    width: number;
    currentTrack: string;
    step: number;
    keyboardOctive: number;
    timeLength: RollState["timeLength"];
    status: RollState["status"];
    tracks: RollState["tracks"];
    bpm: number;
    activeKeys: RollState["activeKeys"];
    instrument: {};
    keyboards: Record<string, React.FC>;
    ctrs: Record<string, typeof BaseInstrument>;
    keyboardPiano?: boolean;
    events: Record<string, Function | undefined>;
    registInstrument: (name: string, { instrument, keyboard, ctr, }: {
        ctr?: typeof BaseInstrument | undefined;
        instrument?: BaseInstrument | undefined;
        keyboard?: import("react").FC<{}> | undefined;
    }) => void;
    constructor(initialState: Partial<RollState> | undefined);
    changeTrack: (instrument: string) => void;
    changeCurrentTrackOctive: (position: "top" | "bottom", value: number) => void;
    setData: (data: Partial<RollState> | undefined) => void;
    clearTrack: () => void;
    setKeyboardOctive: (value: number) => void;
    initChangeObserver: () => void;
    init: () => void;
    get defaultTimeLength(): number;
    get keyboardLength(): number;
    start: () => void;
    play: () => void;
    stop: (triggerPlayEnd?: boolean) => void;
    trigNote: (name: string, note: Note, time: Unit.Time) => void;
    attackNote: (name: string, note: NoteOnlyValue, time?: Unit.Time) => void;
    releaseNote: (name: string, note: NoteOnlyValue, time?: Unit.Time) => void;
    setBpm: (value: number) => void;
    setTimeLenth: (value: number) => void;
    trigInstruments: (time: Unit.Time) => void;
}
