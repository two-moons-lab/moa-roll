import React, { createContext } from 'react'
import styles from './index.less'
import { RollState, RollStore, Track } from './Store';
import { observer } from 'mobx-react'
import classNames from 'classnames';
import { Controller } from '../Controller/index';

export const RollContext = createContext<RollStore>(null)

type RollProps = {
  height?: number;
  // width?: number;
  data?: Partial<RollState>;
  showController: boolean;
  modelRef?: React.MutableRefObject<ModelRef>
}

export type ModelRef = {
  play: () => void;
  stop: () => void;
  start: () => void;
  setData: (data: Partial<RollState>) => void
}

@observer
export class Roll extends React.Component<RollProps> {
  store: RollStore

  constructor(props: RollProps) {
    super(props)
    this.store = new RollStore(props.data)

    props.modelRef && (props.modelRef.current = {
      play: this.store.play,
      stop: this.store.stop,
      start: this.store.start,
      setData: this.store.setData
    });
  }

  render() {
    const store = this.store
    const currentTrackData = store.tracks.find(track => track.instrument === store.currentTrack) as Track

    return <RollContext.Provider value={store}>
      <div className={styles['moa-roll']}>
        <div className={styles.sider}>
          {Object.keys(store.keyboards).map(name => {
            return <div key={name} onClick={() => {
              store.changeTrack(name)
            }} className={classNames(styles['sider-item'], store.currentTrack === name && styles['sider-item--active'])}>
              {name}
            </div>
          })}
          {
            this.props.showController && <Controller />
          }
        </div>
        {/* 这里将notes作为props传入的原因是对于单一的instrument来说它并不需要考虑其他的track, 但trigKeys却是所有instrument都可用的状态 */}
        <div className={styles.content}>
          {
            React.createElement(store.keyboards[store.currentTrack], {
              notes: currentTrackData.notes,
              activeKeys: store.activeKeys[store.currentTrack],
              key: store.currentTrack,
              size: {
                width: this.props.width,
                height: this.props.height
              }
            } as any)
          }
        </div>
      </div>
    </RollContext.Provider>
  }
}