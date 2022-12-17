import React from 'react'
import { Note } from 'typings/common'
import styles from './index.less'
import classNames from 'classnames';
import { genKeys, getFullNoteStr } from '../../../utils/note';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import { RollContext } from '../../Roll/index';
import { KeyboardStore } from '../Store';



export const CommonKeyboard: React.FC<{
  notes: Note[]
  activeKeys: string[]
  size: {
    width: number;
    height: number
  }
}> = observer(({ notes, activeKeys, size }) => {
  const keys = genKeys(notes)
  const store = useContext(RollContext)
  const keyboardStore = new KeyboardStore(store)

  useEffect(() => {
    keyboardStore.mountKeyboardEvent()
    return () => keyboardStore.unmountKeyboardEvents()
  }, [store.keyboardOctive])

  if (!keys.length) return <div className={styles.empty}>NO DATA</div>

  const Notes: React.FC<{ notes: Note[] }> = observer(({ notes }) => {
    const length = store.keyboardLength
    const items = []
    const ITEM_WIDTH = 30

    let index = 0;
    while (index < length) {
      const currentActiveNote = notes.find(note => note.time === index)

      if (currentActiveNote) {
        const { duration } = currentActiveNote
        items.push({ type: 'note', length: duration || 1, index: [index, index + (duration || 1) - 1] })
        index += duration || 1
      } else {
        items.push({
          type: 'empty',
          length: 1,
          index: [index, index]
        })
        index += 1
      }
    }

    return <div className={styles['notes-row']}>
      {/* grid层主要用作交互，上层的item-notes只负责展示 */}
      <div className={styles['item-grid']}>
        {Array(length).fill('grid').map((_, index) => {
          return <div style={{
            width: ITEM_WIDTH
          }}></div>
        })}
      </div>

      <div className={styles['item-notes']}>
        {items.map((item) => {
          return <div className={classNames(styles.item, item.type === 'note' && styles['item-note'], (item.index[0] <= store.step && store.step <= item.index[1]) && styles['item--active'])} style={{
            width: (item.length ? item.length : 1) * ITEM_WIDTH
          }}></div>
        })}
      </div>
    </div >
  })

  return <div className={styles.container} style={{
    maxHeight: size.height,
  }}>
    <div className={styles.keys}>
      {keys?.map(keyName => {
        return <div className={classNames(styles.key, activeKeys.includes(keyName) && styles['key--active'], keyName.length === 7 && styles['key--pitch'])} >
          <span className={styles['key-code']}>{keyboardStore.noteToKeyMap[keyName]?.slice(-1)}</span>
          <span>
            {keyName}
          </span>
        </div>
      })}
    </div>

    <div className={styles.notes}>
      {keys?.map(keyName => {
        return <Notes notes={notes.filter(note => getFullNoteStr(note.value) === keyName)} />
      })}
    </div>
  </div>
})
