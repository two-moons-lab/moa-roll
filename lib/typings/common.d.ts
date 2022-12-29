export type Note = {
    value: string;
    time: number;
    duration?: number;
};
export type NoteOnlyValue = Omit<Note, "time" | "duration">;
