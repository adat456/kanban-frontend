import React, { useContext, useState, useRef } from "react";

import { BoardsContext, CurBoardIdContext, UserStatusContext, columnData, taskData } from "../../Context";
import { handleDisplayMsg } from "../helpers";

interface Prop {
    task: taskData,
    numCompleteSubtasks: number,
    colId: string,
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    setViewTaskVis: React.Dispatch<React.SetStateAction<boolean>>,
    setEditTaskVis: React.Dispatch<React.SetStateAction<boolean>>,
};

const ViewTask: React.FC<Prop> = function({ task, numCompleteSubtasks, colId, setDisplayMsg, setViewTaskVis, setEditTaskVis }) {
    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);
    const userStatus = useContext(UserStatusContext);

    const [ updatedColId, setUpdatedColId ] = useState(colId);
    const [ numComplete, setNumComplete ] = useState(numCompleteSubtasks);

    const year = task.deadline?.slice(0, 4);
    const month = task.deadline?.slice(5, 7);
    const day = task.deadline?.slice(8, 10);

    const assigneeIconRef = useRef<HTMLDivElement | null>(null);
    function handleNamePopup(userId: string) {
        const assigneeNamePopup = document.querySelector(`#assignee-name-${userId}`);
        assigneeNamePopup?.classList.toggle("hidden");
    };

    const assigneeIcons = task.assignees.map(assignee => {
        const nameArr = assignee.userName.split(" ");
        const initials = nameArr.map(name => name.slice(0, 1)).join("");
        return (
            <div key={assignee.userId} ref={assigneeIconRef} className="assignee-icon" onMouseEnter={() => handleNamePopup(assignee.userId)} onMouseLeave={() => handleNamePopup(assignee.userId)}>
                <p>{initials}</p>
                <div className="assignee-full-name hidden" id={`assignee-name-${assignee.userId}`}>
                    <div className="pointer"></div>
                    <p>{assignee.userName}</p>
                </div>
            </div>
        );
    });

    const subtasksArr = task.subtasks.map(subtask => {
        if (subtask.status) {
            return (
                <div className="subtask checked-subtask" key={subtask._id}>
                    <label htmlFor={subtask._id}><input type="checkbox" name="subtasks" id={subtask._id} className={`a${task._id}-subtask-checkbox`} onClick={handleClick} defaultChecked />{subtask.subtask}</label>  
                </div>
            );
        } else {
            return (
                <div className="subtask" key={subtask._id}>
                    <label htmlFor={subtask._id}><input type="checkbox" name="subtasks" id={subtask._id} className={`a${task._id}-subtask-checkbox`} onClick={handleClick} />{subtask.subtask}</label>
                </div>
            );
        };
    });

    function handleClick(e: React.MouseEvent<HTMLInputElement>) {
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
        const arr = [...document.querySelectorAll(`.a${task._id}-subtask-checkbox`)];
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
                taskId: task._id,
                updatedSubtasks: subtasks,
                updatedColId,
                colId
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
                    <div>
                        <h2>{task.task}</h2>
                        {task.deadline ? 
                            <p className="deadline">{task.deadline ? `${month}/${day}/${year}` : ""}</p> : null
                        }
                    </div>
                    {(userStatus === "Creator" || userStatus === "Co-creator") ?
                        <button type="button" onClick={() => {handleViewTaskModal(); setEditTaskVis(true)}}>
                            <svg viewBox="0 0 5 20" width="5" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="#828FA3" fillRule="evenodd"><circle cx="2.308" cy="2.308" r="2.308"/><circle cx="2.308" cy="10" r="2.308"/><circle cx="2.308" cy="17.692" r="2.308"/></g></svg>
                        </button> : null       
                    }
                </div>   
                {task.assignees.length > 0 ?
                    <div className="assignee-icons">
                        {assigneeIcons}
                    </div> : null
                }
                <p className="desc">{task.desc}</p>
                {task.subtasks.length > 0 ? 
                    <fieldset className="checkboxes-field"> 
                        <legend>{`Subtasks (${numComplete} of ${task.subtasks.length})`}</legend>
                        {subtasksArr}
                    </fieldset> : null
                }
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