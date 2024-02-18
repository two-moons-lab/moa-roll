import React from "react";
import styles from "./index.less";
import { useContext } from "react";
import { observer } from "mobx-react";
import { RollContext } from "../../Roll";
import classNames from "classnames";

export const Controller: React.FC<{
  controllers: Record<string, boolean>;
}> = observer(({ controllers = {} }) => {
  const store = useContext(RollContext);

  return (
    <div className={styles.controller}>
      <div className={styles.bpm}>
        <label>bpm: {store.bpm}</label>
        <input
          type="range"
          min={40}
          max={200}
          value={store.bpm}
          onInput={(e) => {
            store.setBpm(Number(e.target.value));
          }}
        />
      </div>
      {store.keyboardPiano && (
        <div className={styles.keyboard}>
          <label>keys octive: {store.keyboardOctive}</label>

          <div
            className={classNames(styles.btn)}
            onClick={() => store.setKeyboardOctive(store.keyboardOctive + 1)}
          >
            ↑
          </div>
          <div
            className={classNames(styles.btn)}
            onClick={() => store.setKeyboardOctive(store.keyboardOctive - 1)}
          >
            ↓
          </div>
        </div>
      )}

      {controllers.octive !== false && (
        <div className={styles.octive}>
          <label>top octive: </label>
          <div className={styles.row}>
            <div
              className={classNames(styles.btn)}
              onClick={() => store.changeCurrentTrackOctive("top", 1)}
            >
              ↑
            </div>
            <div
              className={classNames(styles.btn)}
              onClick={() => store.changeCurrentTrackOctive("top", -1)}
            >
              ↓
            </div>
          </div>

          <label>bottom octive: </label>
          <div className={styles.row}>
            <div
              className={classNames(styles.btn)}
              onClick={() => store.changeCurrentTrackOctive("bottom", 1)}
            >
              ↑
            </div>
            <div
              className={classNames(styles.btn)}
              onClick={() => store.changeCurrentTrackOctive("bottom", -1)}
            >
              ↓
            </div>
          </div>
        </div>
      )}

      {controllers.length !== false && (
        <div className={styles.length}>
          <label>length: {store.timeLength}</label>
          <div className={styles.row}>
            <span
              className={classNames(styles.btn)}
              onClick={() => store.setTimeLenth(store.keyboardLength - 4)}
            >
              -
            </span>
            <span
              className={classNames(styles.btn)}
              onClick={() => store.setTimeLenth(store.keyboardLength + 4)}
            >
              +
            </span>
          </div>
        </div>
      )}

      {controllers.clear !== false && (
        <div
          onClick={() => store.clearTrack()}
          className={classNames(styles.btn)}
        >
          clear
        </div>
      )}

      {store.status === "playing" ? (
        <div onClick={() => store.stop()} className={classNames(styles.btn)}>
          stop
        </div>
      ) : (
        <div onClick={() => store.play()} className={classNames(styles.btn)}>
          play
        </div>
      )}
    </div>
  );
});
