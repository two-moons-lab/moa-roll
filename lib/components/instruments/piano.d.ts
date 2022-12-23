import { BaseInstrument } from "./base";
import * as Tone from "tone";
export declare class Piano implements BaseInstrument {
    synth: Tone.PolySynth<Tone.Synth<Tone.SynthOptions>>;
    releaseAll(): void;
    triggerAttack(value: string, time: Tone.Unit.Time | undefined): void;
    triggerRelease(value: string, time: Tone.Unit.Time | undefined): void;
}
