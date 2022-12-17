import { computed, makeObservable } from 'mobx';
import { RollStore } from '../Roll/Store';
import { getNoteWithOctive } from '../../utils/note';
import { isNumber } from 'lodash';

export type KeyboardState = {}
const CODES = ['Q', 2, 'W', 3, 'E', 'R', 5, 'T', 6, 'Y', 7, 'U', 'I']
const NAMES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B', 'C']

export class KeyboardStore {
    contextStore: RollStore

    constructor(context: RollStore, initState?: Partial<KeyboardState>) {
        Object.assign(this, initState)
        this.contextStore = context
        makeObservable(this)
    }

    keyStatusMap: Record<string, boolean> = {}

    @computed
    get noteToKeyMap() {
        const re: Record<string, string> = {}

        const context = this.contextStore
        const contextOctive = context.keyboardOctive

        NAMES.forEach((name, index) => {
            const code = CODES[index]
            // 最后一个C加一个八度
            const octive = index === NAMES.length - 1 ? contextOctive + 1 : contextOctive
            re[getNoteWithOctive(name, octive)] = isNumber(code) ? `Digit${code}` : `Key${code}`
        })

        return re
    }

    @computed
    get keyToNoteMap() {
        const re: Record<string, string> = {}

        for (let note in this.noteToKeyMap) {
            re[this.noteToKeyMap[note]] = note
        }

        return re
    }

    onKeydown = (event: KeyboardEvent) => {
        const code = event.code
        if (this.keyStatusMap[code] === true) return
        this.keyStatusMap[code] = true

        const note = this.keyToNoteMap[code]
        if (!note) return

        this.contextStore.attackNote(this.contextStore.currentTrack, {
            value: this.keyToNoteMap[code]
        })
    }

    onKeyup = (event: KeyboardEvent) => {
        const code = event.code
        this.keyStatusMap[code] = false
        const note = this.keyToNoteMap[code]
        if (!note) return

        this.contextStore.releaseNote(this.contextStore.currentTrack, {
            value: this.keyToNoteMap[code]
        })
    }

    unmountKeyboardEvents = () => {
        window.removeEventListener('keyup', this.onKeyup)
        window.removeEventListener('keydown', this.onKeydown)
    }

    mountKeyboardEvent = () => {
        window.addEventListener('keyup', this.onKeyup)
        window.addEventListener('keydown', this.onKeydown)
    }
}
