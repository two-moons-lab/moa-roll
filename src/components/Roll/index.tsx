import React, { createContext } from "react";
import styles from "./index.less";
import { RollState, RollStore, Track } from "./Store";
import { observer } from "mobx-react";
import classNames from "classnames";
import { Controller } from "../Controller/index";
import { cloneDeep, isFunction } from "lodash";

export const RollContext = createContext<RollStore>(null);

type RollProps = {
  scrollHeight?: number | string;
  scrollWidth?: number | string;
  data?: Partial<RollState>;
  showController?: boolean;
  modelRef?: React.MutableRefObject<ModelRef> | ((ref: ModelRef) => void);
  onPlayEnd?: () => void;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export type RollData = Partial<RollState>;

export type ModelRef = {
  play: () => void;
  stop: () => void;
  start: () => void;

  getData: () => RollData;
  setData: (data: RollData) => void;
};

@observer
export class Roll extends React.Component<RollProps> {
  store: RollStore;

  constructor(props: RollProps) {
    super(props);
    this.store = new RollStore(props.data);
    this.store.events.onPlayEnd = props.onPlayEnd;

    if (props.modelRef) {
      const ref = {
        play: this.store.play,
        stop: this.store.stop,
        start: this.store.start,
        setData: this.store.setData,
        getData: () =>
          cloneDeep({
            timeLength: this.store.timeLength,
            currentTrack: this.store.currentTrack,
            tracks: this.store.tracks,
          }),
        changeTrack: this.store.changeTrack,
      };

      if (isFunction(props.modelRef)) {
        props.modelRef(ref);
      } else {
        props.modelRef.current = ref;
      }
    }
  }

  render() {
    const {
      scrollHeight,
      scrollWidth,
      data,
      showController,
      modelRef,
      onPlayEnd,
      ...others
    } = this.props;

    const store = this.store;
    const currentTrackData = (store.tracks.find(
      (track) => track.instrument === store.currentTrack
    ) as Track) || {
      instrument: store.currentTrack,
      notes: [],
    };

    return (
      <RollContext.Provider value={store}>
        <div className={styles["moa-roll"]} {...others}>
          <div className={styles.sider}>
            {Object.keys(store.keyboards).map((name) => {
              return (
                <div
                  key={name}
                  onClick={() => {
                    store.changeTrack(name);
                  }}
                  className={classNames(
                    styles["sider-item"],
                    store.currentTrack === name && styles["sider-item--active"]
                  )}
                >
                  {name}
                </div>
              );
            })}
            {this.props.showController && <Controller />}
          </div>
          {/* 这里将notes作为props传入的原因是对于单一的instrument来说它并不需要考虑其他的track, 但trigKeys却是所有instrument都可用的状态 */}
          <div className={styles.wrapper}>
            <div
              className={styles.content}
              style={{
                maxHeight: this.props.scrollHeight,
              }}
            >
              {React.createElement(store.keyboards[store.currentTrack], {
                instrument: store.currentTrack,
                notes: currentTrackData.notes ?? [],
                range: currentTrackData.range,
                maxWidth: this.props.scrollWidth,
                activeKeys: store.activeKeys[store.currentTrack],
                key: store.currentTrack,
              } as any)}
            </div>
          </div>
        </div>
      </RollContext.Provider>
    );
  }
}
