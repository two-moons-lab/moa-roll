import { NOISE_VALUES } from "../constants";
// note相关命名规范
// noteStr: 形如 'C4#/D5b'
// noteValue: 原始的用户输入的noteValue，形如 'C4#'

export const OCTIVE_NAMES = [
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
];

export const normalizeName = (name: string) => {
  return OCTIVE_NAMES.find((nameOrArr) => {
    if (name.length === 2 && nameOrArr.length === 5)
      return nameOrArr.includes(name);
    else return nameOrArr === name;
  });
};

export const getNoteWithOctive = (name: string, octive: number) => {
  if (name.length === 5)
    return name
      .split("/")
      .map((name) => name + octive)
      .join("/");
  else return name + octive;
};

export const getFullNoteStr = (noteStr: string) => {
  if (NOISE_VALUES.includes(noteStr)) return noteStr;
  if (noteStr.includes("/")) return noteStr;
  const { octive, name } = separateNoteStr(noteStr);
  const fullName = normalizeName(name);
  return composeNoteStr(fullName as string, octive);
};

export const sortNoteValues = (noteValues: string[]) => {
  return noteValues.sort((a, b) => {
    const octiveA = a.slice(-1);
    const octiveB = b.slice(-1);

    const nameAIndex = OCTIVE_NAMES.indexOf(a.slice(0, 1));
    const nameBIndex = OCTIVE_NAMES.indexOf(b.slice(0, 1));

    const pitchA = a.length === 3 ? a.slice(1, -1) : 0;
    const pitchB = b.length === 3 ? b.slice(1, -1) : 0;

    if (octiveA === octiveB) {
      if (nameAIndex === nameBIndex) {
        if (pitchA === pitchB) {
          return 0;
        } else return comparePitch(pitchA as PitchSign, pitchB as PitchSign);
      } else return nameAIndex < nameBIndex ? -1 : 1;
    } else return octiveA < octiveB ? -1 : 1;
  });
};

export const normalizeNoteValues = (noteValues: string[]) => {
  return noteValues.map((value) => {
    const { octive, name } = separateNoteStr(value);

    return (normalizeName(name) as string) + octive;
  });
};

type PitchSign = "#" | "b";
const comparePitch = (a: PitchSign, b: PitchSign) => {
  const sortOrder = ["b", 0, "#"];
  return sortOrder.indexOf(a) - sortOrder.indexOf(b);
};

export const separateNoteStr = (noteStr: string) => {
  const name = noteStr.slice(0, -1);
  const octive = noteStr.slice(-1);

  return { octive, name };
};

export const composeNoteStr = (name: string, octive: string) => {
  if (name.length === 5) {
    return name
      .split("/")
      .map((name) => name + octive)
      .join("/");
  } else return name + octive;
};

export const genKeys = (noteValues: string[], range?: string[]) => {
  let re: string[] = [];

  if (noteValues.length === 0 && !range) return [];
  const sortedNoteStrs = normalizeNoteValues(
    sortNoteValues(noteValues.slice().concat(range ?? []))
  );

  const { name: lowesetName, octive: lowestOctive } = separateNoteStr(
    sortedNoteStrs[0]
  );
  const { name: highestName, octive: hightestOctive } = separateNoteStr(
    sortedNoteStrs[sortedNoteStrs.length - 1]
  );

  // 获取最低音与最高音之前的八度个数
  const octiveDistance = Number(hightestOctive) - Number(lowestOctive);

  // 如果最高音和最低音在同一个八度，就不再填充中间的八度音
  if (octiveDistance === 0) {
    re = OCTIVE_NAMES.slice(
      OCTIVE_NAMES.indexOf(lowesetName),
      OCTIVE_NAMES.indexOf(highestName) + 1
    ).map((name) => composeNoteStr(name, lowestOctive));
  } else {
    const headNotes = OCTIVE_NAMES.slice(OCTIVE_NAMES.indexOf(lowesetName)).map(
      (name) => composeNoteStr(name, lowestOctive)
    );
    const tailNotes = OCTIVE_NAMES.slice(
      0,
      OCTIVE_NAMES.indexOf(highestName) + 1
    ).map((name) => composeNoteStr(name, hightestOctive));

    re.push(...headNotes);

    for (
      let octive = Number(lowestOctive) + 1;
      octive <= Number(hightestOctive) - 1;
      octive++
    ) {
      re.push(
        ...OCTIVE_NAMES.map((name) => composeNoteStr(name, String(octive)))
      );
    }
    re.push(...tailNotes);
  }

  return re.reverse();
};
