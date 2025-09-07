/**
 * MoaTone - A lightweight audio synthesis library to replace Tone.js
 * Provides essential audio synthesis capabilities with simpler API
 */

import _ from "lodash";
import { getFrequency, parseNote } from "./calc";

export const soundPresets = {
  piano: {
    requiredResources: [],
    createNodes: (audioContext: AudioContext) => {
      // 创建振荡器

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();

      // Configure oscillator
      oscillator.type = "triangle";
      // Configure filter for more piano-like sound
      filterNode.type = "lowpass";

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);

      return {
        output: gainNode,
        start: (when = audioContext.currentTime) => {
          gainNode.gain.setValueAtTime(0, when);
          gainNode.gain.linearRampToValueAtTime(0.7 * 0.8, when + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, when + 1.5);
          oscillator.start(when);
        },
        stop: (when = audioContext.currentTime + 2) => oscillator.stop(when),
        setFrequency: (frequency: number, when = audioContext.currentTime) => {
          oscillator.frequency.setValueAtTime(frequency, when);
          filterNode.frequency.setValueAtTime(frequency * 3, when);
          filterNode.Q.setValueAtTime(1, when);
        },
      };
    },
  },
  bass: {
    requiredResources: [],
    createNodes: (audioContext: AudioContext) => {
      let oscillator1: OscillatorNode | null = null;
      let oscillator2: OscillatorNode | null = null;
      let gainNode1: GainNode | null = null;
      let gainNode2: GainNode | null = null;
      let waveShaperNode: WaveShaperNode | null = null;

      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.6, audioContext.currentTime); // 8bit音色整体音量

      return {
        output: masterGain,
        start: (when = audioContext.currentTime) => {
          if (oscillator1 && oscillator2) {
            oscillator1.start(when);
            oscillator2.start(when);
          }
        },
        stop: (when = audioContext.currentTime + 0.5) => {
          if (oscillator1 && oscillator2) {
            try {
              oscillator1.stop(when);
              oscillator2.stop(when);
            } catch (e) {
              // 忽略已停止的振荡器错误
            }
          }
        },
        setFrequency: (frequency: number, when = audioContext.currentTime) => {
          // 创建纯粹的8bit音色
          oscillator1 = audioContext.createOscillator();
          oscillator2 = audioContext.createOscillator();
          gainNode1 = audioContext.createGain();
          gainNode2 = audioContext.createGain();
          waveShaperNode = audioContext.createWaveShaper();

          // 主振荡器：纯方波，更尖锐
          oscillator1.type = "square";
          oscillator1.frequency.setValueAtTime(frequency, when);

          // 副振荡器：脉冲波模拟，更大失谐增加粗糙感
          oscillator2.type = "square";
          oscillator2.frequency.setValueAtTime(frequency * 1.02, when); // 更大的失谐

          // 创建数字失真效果，模拟8bit DAC的量化噪声
          const curve = new Float32Array(65536);
          for (let i = 0; i < 65536; i++) {
            const x = (i - 32768) / 32768;
            // 8bit量化效果：将信号量化到256个级别
            const quantized = Math.round(x * 127) / 127;
            curve[i] =
              Math.sign(quantized) * Math.pow(Math.abs(quantized), 0.8); // 轻微压缩
          }
          waveShaperNode.curve = curve;
          waveShaperNode.oversample = "none"; // 不使用过采样，保持数字感

          // 音量配置，突出方波的尖锐特性
          gainNode1.gain.setValueAtTime(0.8, when); // 主方波更突出
          gainNode2.gain.setValueAtTime(0.2, when); // 副方波作为失真层

          // 连接音频节点：直接连接，不使用滤波器
          oscillator1.connect(gainNode1);
          oscillator2.connect(gainNode2);
          gainNode1.connect(waveShaperNode);
          gainNode2.connect(waveShaperNode);
          waveShaperNode.connect(masterGain);

          // 8bit特有的即时攻击和快速释放
          masterGain.gain.setValueAtTime(0, when);
          masterGain.gain.setValueAtTime(0.7, when + 0.001); // 几乎瞬间攻击
          masterGain.gain.exponentialRampToValueAtTime(0.4, when + 0.05); // 快速衰减
          masterGain.gain.exponentialRampToValueAtTime(0.01, when + 0.3); // 短促释放
        },
      };
    },
  },
};

type AudioOptions = {
  volume?: number;
  reverbLevel?: number;
  preset?: string;
};

class MoaTime {
  static toSeconds(notation: string): number {
    const timeMap: { [key: string]: number } = {
      "1n": 4, // whole note
      "2n": 2, // half note
      "4n": 1, // quarter note
      "8n": 0.5, // eighth note
      "16n": 0.25, // sixteenth note
    };

    const baseTime = timeMap[notation] || 1;
    return baseTime * (60 / MoaTransport.bpm); // Convert to seconds based on BPM
  }
}

class MoaSynth {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private preset: string;

  constructor(options: AudioOptions = {}) {
    this.audioContext = MoaAudio.getContext();
    this.preset = options.preset || "sine";
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  toDestination(): MoaSynth {
    return this;
  }

  triggerAttackRelease(
    note: string | string[],
    duration: number,
    time?: number,
    swing: number = 0.03
  ): void {
    const notes = Array.isArray(note) ? note : [note];
    const startTime = time || this.audioContext.currentTime;

    if (notes.length === 1) {
      // 单音符播放，使用原来的逻辑
      this.playNote(notes[0], duration, startTime);
    } else {
      notes.forEach((singleNote, index) => {
        // Slight delay between notes for better chord effect
        const noteStartTime = startTime + Math.random() * swing;
        this.playNote(singleNote, duration, noteStartTime);
      });
    }
  }

  triggerAttackReleaseArpeggio(
    notes: string[],
    arpeggioInterval: number,
    duration: number,
    swing: number = 0.03
  ): void {
    const startTime = this.audioContext.currentTime;

    if (notes.length === 1) {
      // 单音符播放，使用原来的逻辑
      this.playNote(notes[0], duration, startTime);
    } else {
      notes.forEach((singleNote, index) => {
        // Slight delay between notes for better chord effect
        const swingTime = arpeggioInterval === 0 ? Math.random() * swing : 0;

        this.playNote(
          singleNote,
          duration,
          startTime + index * arpeggioInterval + swingTime
        );
      });
    }
  }

  private async playNote(note: string, duration: number, startTime: number) {
    await MoaAudio.start();
    const frequency = this.noteToFrequency(note);
    const endTime = startTime + duration;

    // Use soundPresets to create audio nodes
    const presetConfig = soundPresets[this.preset as keyof typeof soundPresets];
    const audioNodes = presetConfig.createNodes(this.audioContext);

    // Connect preset output to envelope, then to gain node
    audioNodes.output.connect(this.gainNode);

    // Set frequency using preset's setFrequency method
    audioNodes.setFrequency(frequency, startTime);
    audioNodes.start(startTime);
    audioNodes.stop(endTime);
  }

  private noteToFrequency(note: string): number {
    try {
      const { note: noteName, octave } = parseNote(note);
      return getFrequency({ name: noteName, octave });
    } catch (error) {
      console.warn(`Invalid note format: ${note}`);
      return 440; // Default to A4
    }
  }
}

type TickerClockSource = "worker" | "timeout" | "offline";

/**
 * A class which provides a reliable callback using either
 * a Web Worker, or if that isn't supported, falls back to setTimeout.
 * Based on Tone.js Ticker implementation.
 */
class MoaTicker {
  /**
   * Either "worker" or "timeout" or "offline"
   */
  private _type: TickerClockSource;

  /**
   * The update interval of the worker in seconds
   */
  private _updateInterval: number;

  /**
   * The lowest allowable interval, preferably calculated from context sampleRate
   */
  private _minimumUpdateInterval: number;

  /**
   * The callback to invoke at regular intervals
   */
  private _callback: () => void;

  /**
   * track the callback interval
   */
  private _timeout?: ReturnType<typeof setTimeout>;

  /**
   * private reference to the worker
   */
  private _worker?: Worker;

  constructor(
    callback: () => void,
    type: TickerClockSource,
    updateInterval: number,
    contextSampleRate?: number
  ) {
    this._callback = callback;
    this._type = type;
    /**
     - 音频缓冲区大小 ：128 表示音频缓冲区的采样帧数（samples per buffer），这个是可以按需调整，比如想要大的缓冲区就设置为 256
     - 时间计算 ： 128 / (contextSampleRate || 44100) 计算的是处理这128个采样帧所需的时间（秒）
     */
    this._minimumUpdateInterval = Math.max(
      128 / (contextSampleRate || 44100),
      0.001
    );
    this.updateInterval = updateInterval;

    // create the clock source for the first time
    this._createClock();
  }

  /**
   * Generate a web worker
   */
  private _createWorker(): void {
    const blob = new Blob(
      [
        /* javascript */ `
        // the initial timeout time
        let timeoutTime = ${(this._updateInterval * 1000).toFixed(1)};
        // onmessage callback
        self.onmessage = function(msg){
          timeoutTime = parseInt(msg.data);
        };
        // the tick function which posts a message
        // and schedules a new tick
        function tick(){
          setTimeout(tick, timeoutTime);
          self.postMessage('tick');
        }
        // call tick initially
        tick();
        `,
      ],
      { type: "text/javascript" }
    );
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);

    worker.onmessage = this._callback.bind(this);

    this._worker = worker;
  }

  /**
   * Create a timeout loop
   */
  private _createTimeout(): void {
    this._timeout = setTimeout(() => {
      this._createTimeout();
      this._callback();
    }, this._updateInterval * 1000);
  }

  /**
   * Create the clock source.
   */
  private _createClock(): void {
    if (this._type === "worker") {
      try {
        this._createWorker();
      } catch (e) {
        // workers not supported, fallback to timeout
        this._type = "timeout";
        this._createClock();
      }
    } else if (this._type === "timeout") {
      this._createTimeout();
    }
  }

  /**
   * Clean up the current clock source
   */
  private _disposeClock(): void {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    if (this._worker) {
      this._worker.terminate();
      this._worker.onmessage = null;
    }
  }

  /**
   * The rate in seconds the ticker will update
   */
  get updateInterval(): number {
    return this._updateInterval;
  }
  set updateInterval(interval: number) {
    this._updateInterval = Math.max(interval, this._minimumUpdateInterval);
    if (this._type === "worker" && this._worker) {
      this._worker.postMessage(this._updateInterval * 1000);
    }
  }

  /**
   * The type of the ticker, either a worker or a timeout
   */
  get type(): TickerClockSource {
    return this._type;
  }
  set type(type: TickerClockSource) {
    this._disposeClock();
    this._type = type;
    this._createClock();
  }

  /**
   * Clean up
   */
  dispose(): void {
    this._disposeClock();
  }
}

interface ScheduledEvent {
  id: string;
  callback: (time: number) => void;
  interval: number;
  nextTime: number;
  ticker?: MoaTicker;
  isOneTime?: boolean; // Flag for one-time events
}

class MoaTransport {
  static bpm: number = 120;
  private static isRunning: boolean = false;
  private static scheduledEvents: Map<string, ScheduledEvent> = new Map();
  private static eventIdCounter: number = 0;
  private static lookAhead: number = 0.05; // 50ms look ahead
  private static scheduleAheadTime: number = 0.025; // 25ms schedule ahead time
  private static ticker?: MoaTicker;

  static start(): void {
    MoaTransport.isRunning = true;
    if (!MoaTransport.ticker) {
      MoaTransport.ticker = new MoaTicker(
        MoaTransport._tick.bind(MoaTransport),
        "worker",
        MoaTransport.scheduleAheadTime
      );
    }
  }

  static stop(): void {
    MoaTransport.isRunning = false;
    if (MoaTransport.ticker) {
      MoaTransport.ticker.dispose();
      MoaTransport.ticker = undefined;
    }
  }

  static cancel(): void {
    MoaTransport.scheduledEvents.clear();
    MoaTransport.stop();
  }

  /**
   * The main tick function that schedules events using lookAhead
   */
  private static _tick(): void {
    if (!MoaTransport.isRunning) return;

    const audioContext = MoaAudio.getContext();
    const currentTime = audioContext.currentTime;
    const lookAheadTime = currentTime + MoaTransport.lookAhead;

    // Process all scheduled events
    const eventsToRemove: string[] = [];

    /**
      - 假设有一个每50ms重复的事件
      - 当前时间：0ms，lookAhead：100ms
      - 第一次tick：调度0ms和50ms的事件，nextTime更新为100ms
      - 第二次tick（25ms后）：当前时间25ms，lookAhead到125ms，只会调度100ms的事件
     */
    MoaTransport.scheduledEvents.forEach((event) => {
      // Schedule all events that should happen within the look-ahead window
      while (event.nextTime < lookAheadTime) {
        // Schedule the callback to be executed at the precise audio time
        event.callback(event.nextTime);

        // Handle one-time events
        if (event.isOneTime) {
          eventsToRemove.push(event.id);
          break;
        }

        // Update next execution time for repeating events
        event.nextTime += event.interval;
      }
    });

    // Remove one-time events that have been executed
    eventsToRemove.forEach((eventId) => {
      MoaTransport.scheduledEvents.delete(eventId);
    });

    // Stop the transport if no events are scheduled
    if (MoaTransport.scheduledEvents.size === 0) {
      MoaTransport.stop();
    }
  }

  static scheduleRepeat(
    callback: (time: number) => void,
    interval: string | number
  ): string {
    const eventId = `event_${++MoaTransport.eventIdCounter}`;
    const intervalSeconds =
      typeof interval === "string"
        ? MoaTime.toSeconds(interval)
        : interval / 1000; // Convert ms to seconds

    const audioContext = MoaAudio.getContext();
    const currentTime = audioContext.currentTime;

    const event: ScheduledEvent = {
      id: eventId,
      callback,
      interval: intervalSeconds,
      nextTime: currentTime, // Start immediately
    };

    MoaTransport.scheduledEvents.set(eventId, event);

    // Start the transport if it's not running
    if (!MoaTransport.isRunning) {
      MoaTransport.start();
    }

    return eventId;
  }

  static schedule(callback: (time: number) => void, time: number): string {
    const eventId = `event_${++MoaTransport.eventIdCounter}`;
    const audioContext = MoaAudio.getContext();
    const currentTime = audioContext.currentTime;
    const scheduleTime = time || currentTime;

    const event: ScheduledEvent = {
      id: eventId,
      callback,
      interval: 0, // Not used for one-time events
      nextTime: scheduleTime,
      isOneTime: true,
    };

    MoaTransport.scheduledEvents.set(eventId, event);

    // Start the transport if it's not running
    if (!MoaTransport.isRunning) {
      MoaTransport.start();
    }

    return eventId;
  }

  static clear(eventId: string): void {
    MoaTransport.scheduledEvents.delete(eventId);

    // Stop the transport if no events are scheduled
    if (MoaTransport.scheduledEvents.size === 0) {
      MoaTransport.stop();
    }
  }

  /**
   * Set the look ahead time in seconds
   */
  static setLookAhead(time: number): void {
    MoaTransport.lookAhead = Math.max(time, 0.001);
  }

  /**
   * Set the schedule ahead time in seconds
   */
  static setScheduleAheadTime(time: number): void {
    MoaTransport.scheduleAheadTime = Math.max(time, 0.001);
    if (MoaTransport.ticker) {
      MoaTransport.ticker.updateInterval = time;
    }
  }
}

export class MoaAudio {
  private static audioContext: AudioContext | null = null;

  static getContext(): AudioContext {
    if (!MoaAudio.audioContext) {
      MoaAudio.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return MoaAudio.audioContext;
  }

  static resetContext(): void {
    MoaAudio.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }

  static async start(): Promise<void> {
    const context = MoaAudio.getContext();
    await context.resume();
  }

  static now(): number {
    return MoaAudio.getContext().currentTime;
  }
}

/**
 * Sleep function for creating delays in async operations
 * @param ms - Number of milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Types for MoaPlayer
type PlayerNote = {
  time: number;
  value: string;
  duration: number;
};

type PlayerData = {
  bpm: number;
  timeLength: number;
  notes: PlayerNote[];
};

class MoaPlayer {
  private synth: MoaSynth | null = null;
  private isPlaying: boolean = false;
  private scheduledTimeouts: NodeJS.Timeout[] = [];
  private data: PlayerData | null = null;

  constructor() {
    this.synth = new MoaSynth({
      preset: "sine",
    }).toDestination();
  }

  setData(data: PlayerData): void {
    this.data = data;
  }

  async play(): Promise<void> {
    if (
      !this.data ||
      this.isPlaying ||
      !this.data.notes ||
      this.data.notes.length === 0
    )
      return;

    await MoaAudio.start();
    this.isPlaying = true;
    this.scheduledTimeouts = [];

    // 计算每个时间单位对应的实际秒数
    const beatDuration = 60 / this.data.bpm / 2; // 一拍的秒数，默认半拍

    // 播放所有音符
    this.data.notes.forEach((note) => {
      const startTime = note.time * beatDuration * 1000; // 转换为毫秒
      const duration = note.duration * beatDuration; // 音符持续时间（秒）

      const timeout = setTimeout(() => {
        if (this.synth && this.isPlaying) {
          this.synth.triggerAttackRelease(note.value, duration);
        }
      }, startTime);

      this.scheduledTimeouts.push(timeout);
    });

    // 播放结束后重置状态
    const totalDuration = this.data.timeLength * beatDuration * 1000;
    const endTimeout = setTimeout(() => {
      this.stop();
    }, totalDuration);
    this.scheduledTimeouts.push(endTimeout);
  }

  stop(): void {
    this.isPlaying = false;
    this.scheduledTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.scheduledTimeouts = [];
  }

  dispose(): void {
    this.stop();
    if (this.synth) {
      this.synth = null;
    }
  }
}

// Main MoaTone object that mimics Tone.js API
export const MoaTone = {
  Synth: MoaSynth,
  Transport: MoaTransport,
  Time: MoaTime,
  Player: MoaPlayer,
  soundPresets,
  start: MoaAudio.start,
  now: MoaAudio.now,
  context: {
    get state() {
      return MoaAudio.getContext().state;
    },
    suspend: () => MoaAudio.getContext().suspend(),
    resume: () => MoaAudio.getContext().resume(),
  },
  // Convenience method for scheduleRepeat
  scheduleRepeat: (
    callback: (time: number) => void,
    interval: string | number
  ) => {
    return MoaTransport.scheduleRepeat(callback, interval);
  },
  // Convenience method for schedule
  schedule: (callback: (time: number) => void, time: number) => {
    return MoaTransport.schedule(callback, time);
  },
};

export default MoaTone;
