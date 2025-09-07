import { noteMap } from "rad.js";

// 定义音符类型
export interface Note {
  name: string; // 音名
  octave: number; // 八度
}

// 将音符名称转换为半音数（支持升号和降号）
export const getNoteNumber = (noteName: string): number => {
  return noteMap[noteName];
};

export const NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// 计算频率（A4 = 440Hz）
export const getFrequency = (note: Note): number => {
  const midiNote = getAbsoluteInterval(note);
  const a4 = getAbsoluteInterval({ name: "A", octave: 4 });
  return 440 * Math.pow(2, (midiNote - a4) / 12);
};

// 解析音符字符串（如"C4"）
export function parseNote(noteStr: string): { note: string; octave: number } {
  const match = noteStr.match(/([A-G][#b]?)(\d+)/);
  if (!match) return { note: "C", octave: 4 };
  return { note: match[1], octave: parseInt(match[2]) };
}

export const getAbsoluteInterval = (note: Note | string): number => {
  if (typeof note === "string") {
    note = {
      name: parseNote(note).note,
      octave: parseNote(note).octave,
    };
  }
  const noteIndex = getNoteNumber(note.name);
  return noteIndex + note.octave * 12;
};
