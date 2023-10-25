import React, { createContext } from "react";
import styles from "./index.less";
import { RollState, RollStore, Track } from "./Store";
import { observer } from "mobx-react";
import classNames from "classnames";
import { Controller } from "../components/Controller";
import _, { cloneDeep, isFunction } from "lodash";
import { Overview } from "../components/Overview";
import { CONTENT_CLASS } from "./constants";

export const RollContext = createContext<RollStore>(null);

type RollProps = {
  data?: Partial<RollState>;
  showController?: boolean;
  squash?: boolean;
  modelRef?: React.MutableRefObject<ModelRef> | ((ref: ModelRef) => void);
  onPlayEnd?: () => void;
  onChange?: (data: Partial<RollState>) => void;
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
  static defaultProps: { width: number };

  constructor(props: RollProps) {
    super(props);
    this.store = new RollStore(props.data);
    this.store.events.onPlayEnd = props.onPlayEnd;
    this.store.events.onChange = props.onChange;

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
    const { data, showController, modelRef, onPlayEnd, ...others } = this.props;

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
          {/* 这里将notes作为props传入的原因是对于单一的instrument来说它并不需要考虑其他的track, 但trigKeys却是所有instrument都可复用的全局状态 */}
          <div className={styles.wrapper}>
            {/* <Overview /> */}
            <div
              className={classNames(CONTENT_CLASS, styles.content)}
              style={{
                // @todo temporarily disable scroll 
                // height: this.store.height,
              }}
            >
              {React.createElement(store.keyboards[store.currentTrack], {
                squash: store.squash,
                instrument: store.currentTrack,
                notes: currentTrackData.notes ?? [],
                range: currentTrackData.range,
                activeKeys: store.activeKeys[store.currentTrack],
                key: store.currentTrack,
                width: this.store.width,
              } as any)}
            </div>
          </div>
        </div>
      </RollContext.Provider>
    );
  }
}
