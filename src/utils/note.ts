import { Note } from 'typings/common';
export const OCTIVE_NAMES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']

export const normalizeName = (name: string) => {
    return OCTIVE_NAMES.find(nameOrArr => {
        if (name.length === 2 && nameOrArr.length === 5) return nameOrArr.includes(name)
        else return nameOrArr === name
    })
}

export const getNoteWithOctive = (name: string, octive: number) => {
    if (name.length === 5) return name.split('/').map(name => name + octive).join('/')
    else return name + octive
}

export const getFullNoteStr = (noteStr: string) => {
    if (noteStr.includes('/')) return noteStr
    const { octive, name } = separateNoteStr(noteStr)
    const fullName = normalizeName(name)
    return composeNoteStr(fullName as string, octive)
}

export const sortNotes = (noteArr: Note[]) => {
    return noteArr.sort((aNote, bNote) => {
        const a = aNote.value
        const b = bNote.value

        const octiveA = a.slice(-1)
        const octiveB = b.slice(-1)

        const nameAIndex = OCTIVE_NAMES.indexOf(a.slice(0, 1))
        const nameBIndex = OCTIVE_NAMES.indexOf(b.slice(0, 1))

        const pitchA = a.length === 3 ? a.slice(1, -1) : 0
        const pitchB = b.length === 3 ? b.slice(1, -1) : 0

        if (octiveA === octiveB) {
            if (nameAIndex === nameBIndex) {
                if (pitchA === pitchB) {
                    return 0
                } else return comparePitch(pitchA as PitchSign, pitchB as PitchSign)
            } else return nameAIndex < nameBIndex ? -1 : 1
        } else return octiveA < octiveB ? -1 : 1
    })
}

export const normalizeNote = (noteArr: Note[]) => {
    return noteArr.map(note => {
        const { octive, name } = separateNoteStr(note.value)

        return {
            time: note.time,
            value: normalizeName(name) as string + octive
        }
    })
}

type PitchSign = '#' | 'b'
const comparePitch = (a: PitchSign, b: PitchSign) => {
    const sortOrder = ['b', 0, '#']
    return sortOrder.indexOf(a) - sortOrder.indexOf(b)
}

export const separateNoteStr = (noteStr: string) => {
    const name = noteStr.slice(0, -1)
    const octive = noteStr.slice(-1)

    return { octive, name }
}

export const composeNoteStr = (name: string, octive: string) => {
    if (name.length === 5) {
        return name.split('/').map(name => name + octive).join('/')
    } else return name + octive
}

export const genKeys = (notes: Note[]) => {
    let re: string[] = [];

    if (notes.length === 0) return []
    const sortedNotes = normalizeNote(sortNotes(notes.slice()))

    const { name: lowesetName, octive: lowestOctive } = separateNoteStr(sortedNotes[0].value)
    const { name: highestName, octive: hightestOctive } = separateNoteStr(sortedNotes[notes.length - 1].value)

    // 获取最低音与最高音之前的八度个数
    const octiveDistance = Number(hightestOctive) - Number(lowestOctive)

    // 如果最高音和最低音在同一个八度，就不再填充中间的八度音
    if (octiveDistance === 0) {
        re = OCTIVE_NAMES.slice(OCTIVE_NAMES.indexOf(lowesetName), OCTIVE_NAMES.indexOf(highestName) + 1).map(name => composeNoteStr(name, lowestOctive))
    } else {
        const headNotes = OCTIVE_NAMES.slice(OCTIVE_NAMES.indexOf(lowesetName)).map(name => composeNoteStr(name, lowestOctive))
        const tailNotes = OCTIVE_NAMES.slice(0, OCTIVE_NAMES.indexOf(highestName) + 1).map(name => composeNoteStr(name, hightestOctive))

        re.push(...headNotes)

        for (let octive = Number(lowestOctive) + 1; octive <= Number(hightestOctive) - 1; octive++) {
            re.push(...OCTIVE_NAMES.map(name => composeNoteStr(name, String(octive))))
        }
        re.push(...tailNotes)
    }

    return re.reverse()
}
