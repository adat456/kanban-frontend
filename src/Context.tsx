import { createContext } from "react";

// interfaces for export
export interface subtaskData {
    _id: string,
    subtask: string,
    status: boolean,
    completedBy: {
        userId: string,
        userInitials: string,
    }
};
export interface taskData {
    _id: string,
    task: string,
    desc: string,
    subtasks: subtaskData[],
    // need to change to object
    assignees: {
        userId: string,
        userName: string
    }[],
    created: string,
    deadline: string
};
export interface columnData {
    _id: string,
    name: string,
    tasks: taskData[]
};
export interface boardData {
    _id: string,
    name: string,
    favorite: boolean,
    creator: string,
    contributors: contributorType[],
    columns: columnData[]
};
export interface contributorType {
    key?: number,
    userId: string,
    userName: string,
    userStatus: string,
    alreadyAdded?: boolean,
};

export interface userInterface {
    _id: string,
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    email: string,
    boards: string[],
};
export interface boardsDataInterface {
    boardsData: boardData[] | null,
    setBoardsData: React.Dispatch<React.SetStateAction<boardData[] | null>>
};
export interface curBoardIdInterface {
    curBoardId: string,
    setCurBoardId: React.Dispatch<React.SetStateAction<string>>
};

export const UserContext = createContext<userInterface | null>(null);
export const UserStatusContext = createContext<string | null>(null);
export const BoardsContext = createContext<boardsDataInterface>({ boardsData: null, setBoardsData: () => {} });
export const CurBoardIdContext = createContext<curBoardIdInterface | null>({ curBoardId: "", setCurBoardId: () => {} });
export const ModeContext = createContext("light");