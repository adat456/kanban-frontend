import React, { useContext, useState } from "react";

import { BoardsContext, CurBoardIdContext, columnData, subtaskData } from "../../Context";
import { handleDisplayMsg } from "../helpers";

interface Prop {
    name: string,
    desc: string,
    numCompleteSubtasks: number,
    subtasks: subtaskData[],
    colId: string,
    taskId: string,
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    setViewTaskVis: React.Dispatch<React.SetStateAction<boolean>>,
    setEditTaskVis: React.Dispatch<React.SetStateAction<boolean>>,
    curUserStatus: string
};

const ViewTask: React.FC<Prop> = function({ name, desc, numCompleteSubtasks, subtasks, colId, taskId, setDisplayMsg, setViewTaskVis, setEditTaskVis, curUserStatus }) {
    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);

    const [ updatedColId, setUpdatedColId ] = useState(colId);
    const [ numComplete, setNumComplete ] = useState(numCompleteSubtasks);

    const subtasksArr = subtasks.map(subtask => {
        if (subtask.status) {
            return (
                <div className="subtask checked-subtask" key={subtask._id}>
                    <label htmlFor={subtask._id}><input type="checkbox" name="subtasks" id={subtask._id} className={`a${taskId}-subtask-checkbox`} onClick={handleClick} defaultChecked />{subtask.subtask}</label>  
                </div>
            );
        } else {
            return (
                <div className="subtask" key={subtask._id}>
                    <label htmlFor={subtask._id}><input type="checkbox" name="subtasks" id={subtask._id} className={`a${taskId}-subtask-checkbox`} onClick={handleClick} />{subtask.subtask}</label>
                </div>
            );
        };
    });

    function handleClick(e) {
        toggleSubtaskAppearance(e);
        updateNumCompleteSubtasks();
    };

    function toggleSubtaskAppearance(e: React.MouseEvent<HTMLInputElement>) {
        const subtask = e.target;
        const parent: HTMLDivElement = subtask.closest("div");
        if (subtask.checked) parent.classList.add("checked-subtask");
        if (!subtask.checked) parent.classList.remove("checked-subtask");
    };

    function updateNumCompleteSubtasks() {
        let numCompleteSubtasks = 0;
        const arr = [...document.querySelectorAll(`.a${taskId}-subtask-checkbox`)];
        arr.forEach(item => {
            if (item.checked) numCompleteSubtasks++;
        });
        setNumComplete(numCompleteSubtasks);
    };

    let columnsArr: columnData[] = [];
    boardsData?.forEach(board => {
        if (board._id === curBoardId) {
            columnsArr = board.columns;
        };
    });
    const colOptions = columnsArr?.map(col => {
        return (
            <option key={col._id} value={col._id}>{col.name}</option>
        );
    });

    function handleViewTaskModal() {
        const viewTaskModal: HTMLDialogElement | null = document.querySelector(".view-task-modal");
        viewTaskModal?.close();

        setViewTaskVis(false);
    };

    async function handleSubmitUpdates(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // getting subtask IDs and their statuses
        let subtasks: {id: string, status: boolean}[] = [];
        document.getElementsByName("subtasks").forEach(subtask => {
            subtasks.push({
                id: subtask.id,
                status: subtask.checked
            });
        });
        
        const reqOptions: RequestInit = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({  
                boardId: curBoardId,
                colId, taskId,
                updatedSubtasks: subtasks,
                updatedColId
            }),
            credentials: "include"
        };

        try {
            const res = await fetch("http://localhost:3000/update-task", reqOptions);
            if (res.ok) {
                handleDisplayMsg({
                    ok: true,
                    message: "Task updated",
                    msgSetter: setDisplayMsg
                });

                const updatedBoard = await res.json();
                let updatedBoardsData = boardsData?.filter(board => {
                    return (board._id !== curBoardId);
                });
                if (updatedBoardsData) {
                    updatedBoardsData.push(updatedBoard);
                    setBoardsData(updatedBoardsData);
                };

                handleViewTaskModal();
            } else {
                throw new Error("Unable to update this task.");
            };
        } catch(err) {
            handleDisplayMsg({
                ok: false,
                message: err.message,
                msgSetter: setDisplayMsg
            });
        };
    };

    return (
        <dialog className="form-modal view-task-modal">
            <form method="POST" className="view-task">
                <div className="view-task-header">
                    <h2>{name}</h2>
                    {(curUserStatus === "Creator" || curUserStatus === "Co-creator") ?
                        <button type="button" onClick={() => {handleViewTaskModal(); setEditTaskVis(true)}}>
                            <svg viewBox="0 0 5 20" width="5" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="#828FA3" fillRule="evenodd"><circle cx="2.308" cy="2.308" r="2.308"/><circle cx="2.308" cy="10" r="2.308"/><circle cx="2.308" cy="17.692" r="2.308"/></g></svg>
                        </button> : null
                    }
                </div>   
                <p>{desc}</p>
                <fieldset className="checkboxes-field"> 
                    <legend>{`Subtasks (${numComplete} of ${subtasks.length})`}</legend>
                    {subtasksArr}
                </fieldset>
                <label htmlFor="column">Column</label>
                <select name="column" id="column" defaultValue={colId} onChange={(e) => setUpdatedColId(e.target.value)} >
                    {colOptions}
                </select>
                <button type="submit" className="save-btn" onClick={handleSubmitUpdates}>Save Changes</button>
            </form>
            <button className="close-modal" type="button" onClick={handleViewTaskModal}>
                <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
            </button>
        </dialog>   
    );
};

export default ViewTask;