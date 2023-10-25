import { BaseInstrument } from "./base";
import { MembraneSynth, NoiseSynth } from "tone";
import { Time } from "tone/build/esm/core/type/Units";
export declare class Drum implements BaseInstrument {
    isNoise: boolean;
    static getDrumKitKeys: () => string[];
    static groups: {
        kick: {
            toneInstance: MembraneSynth;
            triggerAttack(time: (Time & number) | undefined): void;
            triggerRelease(time: (Time & number) | undefined): void;
        };
        snare: {
            toneInstance: NoiseSynth;
            triggerAttack(time: (Time & number) | undefined): void;
            triggerRelease(time: (Time & number) | undefined): void;
        };
    };
    releaseAll(): void;
    triggerAttack(value: keyof typeof Drum.groups, time: (Time & number) | undefined): void;
    triggerRelease(value: keyof typeof Drum.groups, time: (Time & number) | undefined): void;
}
