import React from "react";
import ReactDOM from "react-dom";
import { Roll } from "../src/Roll";

const App = () => {
  return (
    <Roll
      keyboardPiano={true}
      showController
      controllers={{}}
      data={{
        timeLength: 16,
        currentTrack: "piano",
        bpm: 120,
        keyboardOctive: 3,
        scale: {
          root: "C",
          type: "ionian",
        },
        tracks: [
          {
            range: ["C3", "C4"],
            instrument: "piano",
            notes: [],
          },
          {
            instrument: "drum",
            notes: [],
          },
          {
            range: ["C2", "C3"],
            instrument: "bass",
            notes: [],
          },
        ],
      }}
    />
  );
};

ReactDOM.render(<App />, document.getElementById("container") as HTMLElement);
