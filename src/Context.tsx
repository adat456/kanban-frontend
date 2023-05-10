import { createContext } from "react";

// interfaces for export
export interface subtaskData {
    _id: string,
    subtask: string,
    status: boolean
};
export interface taskData {
    _id: string,
    task: string,
    desc: string,
    subtasks: subtaskData[]
};
export interface columnData {
    _id: string,
    name: string,
    tasks: taskData[]
};
export interface boardData {
    _id: string,
    name: string,
    columns: columnData[]
};

export interface boardsDataPair {
    boardsData: boardData[] | null,
    setBoardsData: React.Dispatch<React.SetStateAction<boardData[] | null>>
};

export interface curBoardIdPair {
    curBoardId: string | null,
    setCurBoardId: React.Dispatch<React.SetStateAction<string | null>>
};

export const BoardsContext = createContext<boardsDataPair | null>(null);
export const CurBoardIdContext = createContext<curBoardIdPair | null>(null);
export const ModeContext = createContext("light");