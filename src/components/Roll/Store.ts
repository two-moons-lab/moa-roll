import _ from "lodash";
import { action, makeObservable, observable, computed } from "mobx";
import * as Tone from 'tone';
import { Unit } from "tone";
import { Note } from 'typings/common'
import { getFullNoteStr } from '../../utils/note';
import { CommonKeyboard } from '../keyboards/Common/index';

export type Status = 'stop' | 'playing'
export type Track = {
    instrument: string,
    notes: Note[]
}

export type RollState = {
    length: number,
    currentTrack: string,
    keyboardOctive: number,
    step: number,
    range: [string, string],
    timeLength: number | undefined,
    tracks: Track[],
    activeKeys: Record<string, string[]>
    bpm: number,
    status: Status,
    timeSignature: [number, number]

    keyboards: Record<string, React.FC>,
    instrument: Record<string, Tone.Synth>,
}

export class RollStore {
    @observable currentTrack = 'piano'
    @observable step = -1
    @observable keyboardOctive: number = 4
    @observable timeLength = undefined
    @observable status: Status = 'stop'
    @observable tracks: Track[] = [{
        instrument: 'piano',
        notes: []
    }, {
        instrument: 'bass',
        notes: []
    }]
    @observable bpm: number = 110
    @observable activeKeys: Record<string, string[]> = {
        piano: [],
        bass: []
    }

    instrument: Record<string, Tone.PolySynth> = {}
    keyboards: Record<string, React.FC> = {}

    registInstrument = (name: string, instrument: Tone.PolySynth, component: React.FC) => {
        instrument.toDestination()
        this.instrument[name] = instrument
        this.keyboards[name] = component
    }

    constructor(initialState: Partial<RollState> | undefined) {
        this.setData(initialState)
        this.init()

        makeObservable(this);
    }

    @action changeTrack = (instrument: string) => {
        this.currentTrack = instrument
    }

    @action
    setData = (initialState: Partial<RollState> | undefined) => {
        Object.assign(this, initialState)
        Tone.Transport.bpm.value = this.bpm
    }

    @action
    setKeyboardOctive = (value: number) => {
        this.keyboardOctive = value
    }

    init = () => {
        this.registInstrument('piano', new Tone.PolySynth(), CommonKeyboard)
        this.registInstrument('bass', new Tone.PolySynth(), CommonKeyboard)
    }

    @computed
    get defaultTimeLength() {
        const maxValues: number[] = []
        this.tracks.forEach((track) => {
            const notes = track.notes as { time: number }[]
            maxValues.push(notes.slice().sort((a, b) => a.time - b.time)[notes.length - 1].time + 1)
        })

        return maxValues.sort((a, b) => a - b)[maxValues.length - 1] || 0
    }

    @computed get keyboardLength() {
        return this.timeLength || this.defaultTimeLength
    }

    @action
    start = () => {
        Tone.start()
        Tone.Transport.start()
    }

    @action
    play = () => {
        if (this.status === 'playing') return
        this.start()

        this.status = 'playing'
        Tone.Transport.scheduleRepeat(this.trigInstruments, '4n')
    }

    @action
    stop = () => {
        if (this.status === 'stop') return

        this.status = 'stop'
        Tone.Transport.cancel()
        for (let name in this.instrument) {
            const instrment = this.instrument[name]
            instrment.releaseAll()
        }

        for (let name in this.activeKeys) {
            this.activeKeys[name] = []
        }

        Tone.Transport.stop()

        this.step = -1
    }

    trigNote = (name: string, note: Note, time: Unit.Time) => {
        this.attackNote(name, note, time)

        const { duration } = note
        Tone.Transport.schedule((time) => this.releaseNote(name, note, time), duration ? `+${Tone.Time('4n').toSeconds() * duration}` : '+4n')
    }

    @action
    attackNote = (name: string, note: Note, time?: Unit.Time) => {
        const fullNoteStr = getFullNoteStr(note.value)
        const { activeKeys } = this

        if (activeKeys[name].includes(fullNoteStr)) return

        const instrument = this.instrument[name]
        this.activeKeys[name] = _.union(this.activeKeys[name], [fullNoteStr])
        instrument.triggerAttack(note.value, time || Tone.now())
    }

    @action
    releaseNote = (name: string, note: Note, time?: Unit.Time) => {
        const fullNoteStr = getFullNoteStr(note.value)
        const { activeKeys } = this

        if (!activeKeys[name].includes(fullNoteStr)) return

        const instrument = this.instrument[name]
        this.activeKeys[name].splice(this.activeKeys[name].indexOf(getFullNoteStr(note.value)), 1)
        instrument.triggerRelease(note.value, time || Tone.now())
    }

    @action setBpm = (value: number) => {
        this.bpm = value
        Tone.Transport.bpm.value = value
    }

    @action
    trigInstruments = (time: Unit.Time) => {
        const handleStep = this.step + 1

        for (let name in this.instrument) {
            const trackData = this.tracks.find(track => track.instrument === name) as Track
            if (trackData) {
                const notes = trackData.notes.filter(note => note.time === handleStep)
                if (notes.length) {
                    notes.forEach(note => {
                        this.trigNote(name, note, time)
                    })
                }
            }
        }

        const { step, keyboardLength } = this
        if (step === keyboardLength) {
            this.stop()
        } else {
            this.step += 1
        }
    }
}