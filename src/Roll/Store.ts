import { Bass, Piano, Drum } from "instruments";
import _ from "lodash";
import {
  action,
  makeObservable,
  observable,
  computed,
  autorun,
  IReactionDisposer,
} from "mobx";
import * as Tone from "tone";
import { Unit } from "tone";
import { Note, NoteOnlyValue } from "typings/common";
import { getFullNoteStr } from "../utils/note";
import { CommonKeyboard } from "../components/keyboards";
import { BaseInstrument } from "../instruments/base";
import { isFunction } from "lodash";
import { OBSERVER_FIELDS } from "./constants";

export type Status = "stop" | "playing";
export type Track = {
  instrument: string;
  notes: Note[];
  range?: [string, string];
};

export type RollState = {
  currentTrack: string;
  keyboardOctive: number;
  step: number;
  timeLength: number | undefined;
  tracks: Track[];
  activeKeys: Record<string, string[]>;
  bpm: number;
  status: Status;
  squash: boolean;
  timeSignature: [number, number];
  height?: number;
  width?: number;
  keyboards: Record<string, React.FC>;
  instrument: Record<string, Tone.Synth>;
};

export class RollStore {
  observeDisposer: IReactionDisposer;

  @observable squash: boolean = true;
  @observable height: number = 300;
  @observable width: number = 300;
  @observable currentTrack = "piano";
  @observable step = -1;
  @observable keyboardOctive: number = 4;
  @observable timeLength: RollState["timeLength"] = undefined;
  @observable status: Status = "stop";
  @observable tracks: Track[] = [];
  @observable bpm: number = 90;
  @observable activeKeys: Record<string, string[]> = {};

  instrument: Record<string, BaseInstrument> = {};
  keyboards: Record<string, React.FC> = {};
  ctrs: Record<string, typeof BaseInstrument> = {};

  keyboardPiano?: boolean = false;

  events: Record<string, Function | undefined> = {
    onPlayEnd: undefined,
    onDataChange: undefined,
  };

  registInstrument = (
    name: string,
    {
      instrument,
      keyboard,
      ctr,
    }: {
      ctr?: typeof BaseInstrument;
      instrument?: BaseInstrument;
      keyboard?: React.FC;
    }
  ) => {
    instrument && (this.instrument[name] = instrument);
    ctr && (this.ctrs[name] = ctr);
    keyboard && (this.keyboards[name] = keyboard);
    this.activeKeys[name] = [];
  };

  constructor(initialState: Partial<RollState> | undefined) {
    makeObservable(this);
    this.setData(initialState);
    this.init();
  }

  @action changeTrack = (instrument: string) => {
    this.currentTrack = instrument;
  };

  @action
  setData = (data: Partial<RollState> | undefined) => {
    Object.assign(this, data);

    setTimeout(() => {
      Tone.Transport.bpm.value = this.bpm;
    });
  };

  @action
  clearTrack = () => {
    this.tracks.forEach((track) => {
      track.notes = [];
    });
  };

  @action
  setKeyboardOctive = (value: number) => {
    this.keyboardOctive = value;
  };

  initChangeObserver = () => {
    this.observeDisposer = autorun(() => {
      const newData = _.cloneDeep(_.pick(this, OBSERVER_FIELDS));
      isFunction(this.events.onDataChange) && this.events.onDataChange(newData);
    });
  };

  init = () => {
    this.initChangeObserver();

    this.registInstrument("piano", { keyboard: CommonKeyboard, ctr: Piano });
    this.registInstrument("bass", { keyboard: CommonKeyboard, ctr: Bass });
    this.registInstrument("drum", { keyboard: CommonKeyboard, ctr: Drum });

    setTimeout(() => {
      this.registInstrument("piano", { instrument: new Piano() });
      this.registInstrument("bass", { instrument: new Bass() });
      this.registInstrument("drum", { instrument: new Drum() });
    });
  };

  @computed get defaultTimeLength() {
    const maxValues: number[] = [];
    this.tracks.forEach((track) => {
      const notes = track.notes as { time: number }[];
      if (!notes.length) return;
      maxValues.push(
        notes.slice().sort((a, b) => a.time - b.time)[notes.length - 1].time + 1
      );
    });

    return maxValues.sort((a, b) => a - b)[maxValues.length - 1] || 0;
  }

  @computed get keyboardLength() {
    return this.timeLength || this.defaultTimeLength;
  }

  @action
  start = () => {
    Tone.start();
    Tone.Transport.start();
  };

  @action
  play = () => {
    if (this.status === "playing") return;
    this.start();

    this.status = "playing";
    Tone.Transport.scheduleRepeat(this.trigInstruments, "8n");
  };

  @action
  stop = () => {
    if (this.status === "stop") return;

    this.events.onPlayEnd && this.events.onPlayEnd();
    this.status = "stop";
    Tone.Transport.cancel(); // 取消之前的schedule repeat
    for (let name in this.instrument) {
      const instrment = this.instrument[name];
      instrment.releaseAll(); // release所有乐器
    }

    for (let name in this.activeKeys) {
      this.activeKeys[name] = [];
    }

    Tone.Transport.stop(); // 停止schedule repeat

    this.step = -1;
  };

  trigNote = (name: string, note: Note, time: Unit.Time) => {
    this.attackNote(name, note, time);

    const { duration = 1 } = note;
    Tone.Transport.schedule(
      (time) => this.releaseNote(name, note, time),
      `+${
        Tone.Time("8n").toSeconds() * duration - Tone.Time("32n").toSeconds()
      }`
    );
  };

  @action
  attackNote = (name: string, note: NoteOnlyValue, time?: Unit.Time) => {
    const currentInstrument = this.instrument[name];
    let fullNoteStr;
    if (currentInstrument.isNoise) fullNoteStr = note.value;
    else fullNoteStr = getFullNoteStr(note.value);

    const { activeKeys } = this;
    if (activeKeys[name].includes(fullNoteStr)) return;

    const instrument = this.instrument[name];
    this.activeKeys[name] = _.union(this.activeKeys[name], [fullNoteStr]);
    instrument.triggerAttack(note.value, time || Tone.now());
  };

  @action
  releaseNote = (name: string, note: NoteOnlyValue, time?: Unit.Time) => {
    const currentInstrument = this.instrument[name];
    let fullNoteStr;
    if (currentInstrument.isNoise) fullNoteStr = note.value;
    else fullNoteStr = getFullNoteStr(note.value);

    const { activeKeys } = this;
    if (!activeKeys[name].includes(fullNoteStr)) return;

    const instrument = this.instrument[name];
    this.activeKeys[name].splice(this.activeKeys[name].indexOf(fullNoteStr), 1);
    instrument.triggerRelease(note.value, time || Tone.now());
  };

  @action setBpm = (value: number) => {
    this.bpm = value;
    Tone.Transport.bpm.value = value;
  };
  @action setTimeLenth = (value: number) => {
    if (value < 0) return;
    this.timeLength = value;
  };

  @action
  trigInstruments = (time: Unit.Time) => {
    const handleStep = this.step + 1;

    for (let name in this.instrument) {
      const trackData = this.tracks.find(
        (track) => track.instrument === name
      ) as Track;
      if (trackData) {
        const notes = trackData.notes.filter(
          (note) => note.time === handleStep
        );
        if (notes.length) {
          notes.forEach((note) => {
            this.trigNote(name, note, time);
          });
        }
      }
    }

    const { step, keyboardLength } = this;
    if (step === keyboardLength) {
      this.stop();
    } else {
      this.step += 1;
    }
  };
}
