import { BaseInstrument } from "./base";
import * as Tone from "tone";

export class Piano implements BaseInstrument {
  synth = new Tone.PolySynth().toDestination();
  releaseAll(): void {
    this.synth.releaseAll;
  }
  triggerAttack(value: string, time: Tone.Unit.Time | undefined): void {
    this.synth.triggerAttack(value, time);
  }
  triggerRelease(value: string, time: Tone.Unit.Time | undefined): void {
    this.synth.triggerRelease(value, time);
  }
}
