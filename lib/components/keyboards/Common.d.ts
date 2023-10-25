import React from "react";
import { Note } from "typings/common";
export declare const CommonKeyboard: React.FC<{
    instrument: string;
    notes: Note[];
    activeKeys: string[];
    range?: [string, string];
    squash: boolean;
    width: number;
}>;
