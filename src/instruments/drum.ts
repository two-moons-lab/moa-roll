import { BaseInstrument } from "./base";
import { MembraneSynth, NoiseSynth } from "tone";
import { Time } from "tone/build/esm/core/type/Units";

export class Drum implements BaseInstrument {
  isNoise = true;
  static getDrumKitKeys = () => {
    return Object.keys(Drum.groups).map((key) => key);
  };
  static groups = {
    kick: {
      toneInstance: new MembraneSynth().toDestination(),
      triggerAttack(time: (Time & number) | undefined) {
        this.toneInstance.triggerAttack("C1", time);
      },
      triggerRelease(time: (Time & number) | undefined) {
        this.toneInstance.triggerRelease(time);
      },
    },
    snare: {
      toneInstance: new NoiseSynth({
        volume: 16,
        noise: {
          // 'white' | 'pink' | 'brown';
          type: "pink",
          playbackRate: 1,
        },
        envelope: {
          attack: 0.001,
          decay: 0.15,
          sustain: 0,
          release: 0.03,
        },
      }).toDestination(),
      triggerAttack(time: (Time & number) | undefined) {
        this.toneInstance.triggerAttack(time);
      },
      triggerRelease(time: (Time & number) | undefined) {
        this.toneInstance.triggerRelease(time);
      },
    },
  };
  releaseAll(): void {
    Object.keys(Drum.groups).forEach((key) => {
      const kitItem = Drum.groups[key as keyof typeof Drum.groups];
      kitItem.toneInstance.triggerRelease();
    });
  }
  triggerAttack(
    value: keyof typeof Drum.groups,
    time: (Time & number) | undefined
  ): void {
    Drum.groups[value].triggerAttack(time);
  }
  triggerRelease(
    value: keyof typeof Drum.groups,
    time: (Time & number) | undefined
  ): void {
    Drum.groups[value].triggerRelease(time);
  }
}
