import { action, computed, makeObservable, observable } from "mobx";
import { RollStore } from "../../Roll/Store";
import {
  getNoteWithOctive,
  genKeys,
  getFullNoteStr,
} from "../../utils/note";
import { isNumber } from "lodash";
import { Drum } from "../../instruments/drum";
import { Note } from "typings/common";

export type KeyboardState = {};
const CODES = ["Q", 2, "W", 3, "E", "R", 5, "T", 6, "Y", 7, "U", "I"];
const NAMES = [
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
  "A",
  "A#/Bb",
  "B",
  "C",
];

export const genKeysFnMap = {
  default(noteValues: string[], range?: string[]) {
    return genKeys(noteValues, range);
  },
  drum() {
    return Drum.getDrumKitKeys();
  },
};

export class KeyboardStore {
  contextStore: RollStore;

  instrument: string;
  constructor(context: RollStore, instrument: string) {
    Object.assign(this, {
      instrument,
    });
    this.contextStore = context;
    makeObservable(this);
  }

  keyStatusMap: Record<string, boolean> = {};

  @observable isPressing = false;

  @computed // note到键盘key的映射
  get noteToKeyMap() {
    const re: Record<string, string> = {};

    const context = this.contextStore;
    const contextOctive = context.keyboardOctive;

    NAMES.forEach((name, index) => {
      const code = CODES[index];
      // 最后一个C加一个八度
      const octive =
        index === NAMES.length - 1 ? contextOctive + 1 : contextOctive;
      re[getNoteWithOctive(name, octive)] = isNumber(code)
        ? `Digit${code}`
        : `Key${code}`;
    });

    return re;
  }

  @computed
  get keyToNoteMap() {
    const re: Record<string, string> = {};

    for (let note in this.noteToKeyMap) {
      re[this.noteToKeyMap[note]] = note;
    }

    return re;
  }

  @observable writeState = {
    startNote: <undefined | Note>undefined,
  };

  clearExistNote = (note: Note) => {
    const currNotes = this.contextStore.tracks.find(
      (track) => track.instrument === this.instrument
    )?.notes as Note[];

    let matchExistNote: Note | undefined;
    if (
      (matchExistNote = currNotes.find((currNote) => {
        if (getFullNoteStr(currNote.value) === note.value) {
          if (currNote.duration) {
            if (
              currNote.time <= note.time &&
              note.time <= currNote.time + currNote.duration - 1
            )
              return true;
          } else return currNote.time === note.time;
        }
        return false;
      }))
    ) {
      return currNotes.splice(currNotes.indexOf(matchExistNote), 1);
    }
  };

  @action
  setStartNote = (note: Note) => {
    if (this.clearExistNote(note)) return;
    this.writeState.startNote = note;
  };

  @action
  setEndNote = (note: Note) => {
    const { startNote } = this.writeState;
    if (!startNote || note.value !== startNote.value) return;

    const currNotes = this.contextStore.tracks.find(
      (track) => track.instrument === this.instrument
    )?.notes as Note[];

    currNotes.splice(note.time, 0, {
      value: note.value,
      time: Math.min(note.time, startNote.time),
      duration: Math.abs(note.time - startNote.time) + 1,
    });
    this.writeState.startNote = undefined;
  };

  onMouseEnter = (note: Note) => {};

  @action
  onKeydown = (event: KeyboardEvent) => {
    const code = event.code;
    if (this.keyStatusMap[code] === true) return;
    this.keyStatusMap[code] = true;

    const note = this.keyToNoteMap[code];
    if (!note) return;

    this.contextStore.attackNote(this.contextStore.currentTrack, {
      value: this.keyToNoteMap[code],
    });
  };

  onKeyup = (event: KeyboardEvent) => {
    const code = event.code;
    this.keyStatusMap[code] = false;
    const note = this.keyToNoteMap[code];
    if (!note) return;

    this.contextStore.releaseNote(this.contextStore.currentTrack, {
      value: this.keyToNoteMap[code],
    });
  };

  unmountKeyboardEvents = () => {
    window.removeEventListener("keyup", this.onKeyup);
    window.removeEventListener("keydown", this.onKeydown);
  };

  mountKeyboardEvent = () => {
    window.addEventListener("keyup", this.onKeyup);
    window.addEventListener("keydown", this.onKeydown);
  };
}
