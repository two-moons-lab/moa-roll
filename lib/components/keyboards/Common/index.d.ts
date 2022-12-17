import React from 'react';
import { Note } from 'typings/common';
export declare const CommonKeyboard: React.FC<{
    notes: Note[];
    activeKeys: string[];
    size: {
        width: number;
        height: number;
    };
}>;
