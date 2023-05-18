import React, { useContext, useState, useRef } from "react";

import { BoardsContext, CurBoardIdContext, UserStatusContext, UserContext, columnData, taskData } from "../../Context";
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
    const user = useContext(UserContext);
    const userInitials = `${user?.firstName.slice(0,1)}${user?.lastName.slice(0,1)}`; 

    const [ updatedColId, setUpdatedColId ] = useState(colId);
    const [ numComplete, setNumComplete ] = useState(numCompleteSubtasks);
    const [ completionDate, setCompletionDate ] = useState(task.completed);

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

    // very complicated :(
    const subtasksArr = task.subtasks.map(subtask => {
        return (
            <div className="subtask-box" key={subtask._id} onClick={handleClick}>
                <div className="before" />
                {subtask.status ?
                    // if the subtask was completed, check whether the completedBy userId matches the user's id. if it was completed...
                    (subtask.completedBy.userId === user?._id ? 
                        // ...by current user, make it defaultChecked so that user can toggle checked status
                        <input type="checkbox" name="subtask" id={subtask._id} data-user-info={`${subtask.completedBy.userInitials}${subtask.completedBy.userId}`} defaultChecked /> :
                        // ...by another user, make it checked and disabled so that it is read-only, and add a class specifying that it was completed by another
                        <input type="checkbox" name="subtask" id={subtask._id} className="completed-by-other" data-user-info={`${subtask.completedBy.userInitials}${subtask.completedBy.userId}`} checked disabled />
                        // either way, add the data-user-info data attribute with completedBy info
                    ): <input type="checkbox" name="subtask" id={subtask._id} />
                }
                {subtask.status ?
                    // if the subtask has been completed, then initials should belong to that user
                    <div className="after">{subtask.completedBy.userInitials}</div> :
                    // if not, then current user's initials will be used whenever a subtask is completed
                    <div className="after">{userInitials}</div>
                }       
                <label htmlFor={subtask._id}>{subtask.subtask}</label>  
            </div>
        );
    });
    function handleClick(e: React.MouseEvent<HTMLDivElement>) {
        addUserInfoToSubtask(e);
        updateNumCompleteSubtasks();
    };
    function addUserInfoToSubtask(e: React.MouseEvent<HTMLDivElement>) {
        const subtaskBox = e.target.closest("div");
        const input = subtaskBox.querySelector("input");
        // data string consists of current user's initials + id
        // if the input is now checked AND the input was not completed by another user (so that it is always checked), add the current user's data
        if (input.checked && !input.classList.contains("completed-by-other")) input.setAttribute("data-user-info", `${userInitials}${user?._id}`);
        if (!input.checked) input.setAttribute("data-user-info", "");
    };
    function updateNumCompleteSubtasks() {
        let numCompleteSubtasks = 0;
        const arr = [...document.getElementsByName("subtask")];
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

    // only used when there are no subtasks, and task can only be either complete or incomplete
    function handleToggleCompletion() {
        if (completionDate) setCompletionDate("");
        if (!completionDate) setCompletionDate(new Date().toISOString().slice(0, 10));
    };

    function handleViewTaskModal() {
        const viewTaskModal: HTMLDialogElement | null = document.querySelector(".view-task-modal");
        viewTaskModal?.close();

        setViewTaskVis(false);
    };

    async function handleSubmitUpdates(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // getting subtask IDs and their statuses
        let subtasks: {
            id: string, 
            status: boolean,
            completedBy?: {
                userInitials: string | undefined,
                userId: string | undefined,
            } | undefined,
        }[] = [];
        document.getElementsByName("subtask").forEach(subtask => {
            const dataUserInfo = subtask.getAttribute("data-user-info");

            subtasks.push({
                id: subtask.id,
                status: subtask.checked,
                completedBy: {
                    userInitials: dataUserInfo?.slice(0, 2),
                    userId: dataUserInfo?.slice(2),
                },
            });
        });
        
        let today = "";
        // checks for completion in two ways:
        // 1. there is a list of subtasks and they are all complete
        // 2. there are no subtasks and there is a completion date
        if ((task.subtasks.length > 0 && numComplete === task.subtasks.length) || (task.subtasks.length === 0 && completionDate)) {
            today = new Date().toISOString().slice(0, 10);
        };

        const reqOptions: RequestInit = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({  
                boardId: curBoardId,
                taskId: task._id,
                updatedSubtasks: subtasks,
                updatedColId,
                colId,
                completed: today,
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
                {task.subtasks.length > 0 ?
                    null :
                    <button type="button" className="add-btn" onClick={handleToggleCompletion}>{`Mark as ${completionDate ? "incomplete" : "complete"}`}</button>
                }
                <button type="submit" className="save-btn" onClick={handleSubmitUpdates}>Save Changes</button>
            </form>
            <button className="close-modal" type="button" onClick={handleViewTaskModal}>
                <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
            </button>
        </dialog>   
    );
};

export default ViewTask;