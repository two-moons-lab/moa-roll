import React from "react";
import { Note } from "typings/common";
import styles from "./index.module.less";
import classNames from "classnames";
import { getFullNoteStr, separateNoteStr } from "../../utils/note";
import { observer } from "mobx-react";
import { useContext, useEffect, useState } from "react";
import { RollContext } from "../../Roll";
import { KeyboardStore, genKeysFnMap } from "./Store";
import { ITEM_WIDTH } from "./constants";
import { isMobile } from "utils/env";
import { singNameMap } from "rad.js";

const getSingleNoteStr = (str: string, mod = "flat") => {
  if (str.includes("/")) return str.split("/")[0];
  else return str;
};

export const CommonKeyboard: React.FC<{
  instrument: string;
  notes: Note[];
  activeKeys: string[];
  range?: [string, string];
  squash: boolean;
  width: number;
  keyboardPiano?: boolean;
  scales?: string[];
  scaleType?: string;
}> = observer(
  ({
    notes,
    squash,
    keyboardPiano,
    scales,
    scaleType,
    range,
    activeKeys,
    width,
    instrument,
  }) => {
    const genKeysFn =
      genKeysFnMap[instrument as keyof typeof genKeysFnMap] ||
      genKeysFnMap.default;

    // 获取纵向的音符
    const keys = genKeysFn(
      notes.map((note) => note.value),
      range
    );

    const store = useContext(RollContext);
    const [keyboardStore] = useState(new KeyboardStore(store, instrument));

    useEffect(() => {
      if (keyboardPiano) {
        keyboardStore.mountKeyboardEvent();
        return () => keyboardStore.unmountKeyboardEvents();
      }
    }, [store.keyboardOctive, keyboardPiano]);

    if (
      !notes.length &&
      !(store.timeLength && range) &&
      !store.ctrs[instrument].isNoise
    )
      return <div className={styles.empty}>NO DATA</div>;

    const Notes: React.FC<{ notes: Note[]; value: string }> = observer(
      ({ notes, value }) => {
        const length = store.keyboardLength;
        const items = [];
        let index = 0;
        while (index < length) {
          const currentActiveNote = notes.find((note) => note.time === index);

          if (currentActiveNote) {
            const { duration } = currentActiveNote;
            items.push({
              type: "note",
              length: duration || 1,
              index: [index, index + (duration || 1) - 1],
            });
            index += duration || 1;
          } else {
            items.push({
              type: "empty",
              length: 1,
              index: [index, index],
            });
            index += 1;
          }
        }

        const { setStartNote, setEndNote, onMouseEnter } = keyboardStore;
        const { name } = separateNoteStr(value);
        const isRoot = scales?.indexOf(name) === 0;

        return (
          <div className={styles["notes-row"]}>
            {/* grid层主要用作交互，上层的item-notes只负责展示 */}
            <div
              className={styles["item-grid"]}
              style={{
                width: squash ? "100%" : "",
              }}
            >
              {Array(length)
                .fill("grid")
                .map((_, index) => {
                  const currNote = {
                    value,
                    time: index,
                  };
                  return (
                    <div
                      className={classNames(
                        styles.item,
                        index === store.step && styles["item-grid--active"]
                      )}
                      key={index}
                      // 这里mousedown之后，dom会消失，可能造成外层不能触发click
                      onMouseDown={() => setStartNote(currNote)}
                      onMouseUp={() => setEndNote(currNote)}
                      onMouseEnter={() => onMouseEnter(currNote)}
                      style={{
                        width: ITEM_WIDTH,
                      }}
                    ></div>
                  );
                })}
            </div>

            {/* 上层的item-notes只负责展示 */}
            <div
              className={styles["item-notes"]}
              style={{
                width: squash ? "100%" : "",
              }}
            >
              {items.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={classNames(
                      styles.note,
                      item.type === "note" && styles["item-note"],
                      item.index[0] <= store.step &&
                        store.step <= item.index[1] &&
                        styles["item-note--active"]
                    )}
                    style={{
                      width: (item.length ? item.length : 1) * ITEM_WIDTH,
                    }}
                  ></div>
                );
              })}
            </div>

            {/* 上层的item-notes只负责展示 */}
            <div
              className={styles["row-hightlight"]}
              style={{
                backgroundColor: scales?.includes(name)
                  ? `rgba(255,87,34,${isRoot ? 0.3 : 0.08})`
                  : "",
              }}
            ></div>
          </div>
        );
      }
    );

    return (
      <div className={styles.container}>
        <div
          className={styles.keys}
          onMouseLeave={() => {
            keyboardStore.isPressing = false;
          }}
        >
          {keys?.map((keyName) => {
            const { name } = separateNoteStr(keyName);
            const singName = scaleType
              ? singNameMap[scaleType][scales?.indexOf(name)]
              : "";
            const isRoot = scales?.indexOf(name) === 0;

            return (
              <div
                key={keyName}
                onTouchStart={() => {
                  keyboardStore.isPressing = true;
                  store.attackNote(store.currentTrack, {
                    value: getSingleNoteStr(keyName),
                  });
                }}
                onTouchEnd={() => {
                  store.releaseNote(store.currentTrack, {
                    value: getSingleNoteStr(keyName),
                  });
                  keyboardStore.isPressing = false;
                }}
                onMouseDown={() => {
                  if (isMobile()) return;
                  keyboardStore.isPressing = true;
                  store.attackNote(store.currentTrack, {
                    value: getSingleNoteStr(keyName),
                  });
                }}
                onMouseUp={() => {
                  if (isMobile()) return;
                  store.releaseNote(store.currentTrack, {
                    value: getSingleNoteStr(keyName),
                  });
                  keyboardStore.isPressing = false;
                }}
                onMouseLeave={() => {
                  store.releaseNote(store.currentTrack, {
                    value: getSingleNoteStr(keyName),
                  });
                }}
                onMouseMove={(e) => {
                  e.preventDefault();
                  if (keyboardStore.isPressing === true) {
                    store.attackNote(store.currentTrack, {
                      value: getSingleNoteStr(keyName),
                    });
                  }
                }}
                className={classNames(
                  styles.key,
                  activeKeys.includes(keyName) && styles["key--active"],
                  (keyName.includes("b") || keyName.includes("#")) &&
                    styles["key--pitch"]
                )}
              >
                {keyboardPiano ? (
                  <span className={styles["key-code"]}>
                    {keyboardStore.noteToKeyMap[keyName]?.slice(-1)}
                  </span>
                ) : (
                  <div />
                )}
                <span>{keyName}</span>
                <span
                  style={{
                    fontSize: 10,
                    marginLeft: 2,
                    color: isRoot ? "#ff5722" : "#ffc2af",
                  }}
                >
                  {singName}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className={classNames(styles.notes, "roll-notes")}
          style={{
            maxWidth: width,
          }}
        >
          {keys?.map((keyName) => {
            return (
              <Notes
                key={keyName}
                value={keyName}
                notes={notes.filter((note) => {
                  const currentInstrument = store.ctrs[instrument];
                  let fullNoteStr;
                  if (currentInstrument.isNoise) fullNoteStr = note.value;
                  else fullNoteStr = getFullNoteStr(note.value);

                  return fullNoteStr === keyName;
                })}
              />
            );
          })}
        </div>
      </div>
    );
  }
);
