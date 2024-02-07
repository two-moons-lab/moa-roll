import { BaseInstrument } from "./base";
import { MembraneSynth, NoiseSynth } from "tone";
import { Time } from "tone/build/esm/core/type/Units";

export class Drum implements BaseInstrument {
  static isNoise = true;
  static getDrumKitKeys = () => {
    return ["kick", "snare"];
  };
  constructor() {
    this.groups = {
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
  }
  releaseAll(): void {
    Object.keys(this.groups).forEach((key) => {
      const kitItem = this.groups[key as keyof typeof this.groups];
      kitItem.toneInstance.triggerRelease();
    });
  }
  triggerAttack(
    value: keyof typeof this.groups,
    time: (Time & number) | undefined
  ): void {
    this.groups[value].triggerAttack(time);
  }
  triggerRelease(
    value: keyof typeof this.groups,
    time: (Time & number) | undefined
  ): void {
    this.groups[value].triggerRelease(time);
  }
}
