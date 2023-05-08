import { useContext } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";

const ViewTask = function({ name, desc, subtasks, colId, taskId, setDisplayMsg }) {
    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);
    
    let numCompleteSubtasks = 0;
    const subtasksArr = subtasks.map(subtask => {
        if (subtask.status) {
            numCompleteSubtasks++;
            return (
                <div className="subtask checked-subtask" key={subtask._id}>
                    <label htmlFor={subtask._id}><input type="checkbox" name="subtasks" id={subtask._id} defaultChecked />{subtask.subtask}</label>
                </div>
            );
        } else {
            return (
                <div className="subtask" key={subtask._id}>
                    <label htmlFor={subtask._id}><input type="checkbox" name="subtasks" id={subtask._id} />{subtask.subtask}</label>
                </div>
            );
        };
    });

    let columnsArr;
    boardsData.forEach(board => {
        if (board._id === curBoardId) {
            columnsArr = board.columns;
        };
    });
    const colOptions = columnsArr.map(col => {
        return (
            <option key={col._id} value={col._id}>{col.name}</option>
        );
    });

    function handleViewTaskModal() {
        const viewTaskModal = document.querySelector(`#view-task-modal-${taskId}`);
        viewTaskModal.close();
    };
    function handleEditTaskModal() {
        const editTaskModal = document.querySelector(`#edit-task-modal-${taskId}`);
        editTaskModal.showModal();
    };

    async function handleSubmitUpdates(e) {
        e.preventDefault();

        // getting subtask IDs and their statuses
        let subtasks = [];
        document.getElementsByName("subtasks").forEach(subtask => {
            subtasks.push({
                id: subtask.id,
                status: subtask.checked
            });
        });

        // getting the column if it changed
        const selElement = document.getElementById("column");
        const updatedColId = selElement.value;
        
        const reqOptions = {
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
                let updatedBoardsData = boardsData.filter(board => {
                    return (board._id !== curBoardId);
                })
                updatedBoardsData.push(updatedBoard);
                setBoardsData(updatedBoardsData);

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
        <dialog className="form-modal" id={`view-task-modal-${taskId}`}>
            <form method="POST" className="view-task">
                <div className="view-task-header">
                    <h2>{name}</h2>
                    <button type="button" onClick={() => {handleViewTaskModal(); handleEditTaskModal();}}><svg viewBox="0 0 5 20" width="5" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="#828FA3" fillRule="evenodd"><circle cx="2.308" cy="2.308" r="2.308"/><circle cx="2.308" cy="10" r="2.308"/><circle cx="2.308" cy="17.692" r="2.308"/></g></svg></button>
                </div>   
                <p>{desc}</p>
                <fieldset className="checkboxes-field">
                    <legend>{`Subtasks (${numCompleteSubtasks} of ${subtasks.length})`}</legend>
                    {subtasksArr}
                </fieldset>
                <label htmlFor="column">Column
                    <select name="column" id="column" defaultValue={colId}>
                        {colOptions}
                    </select>
                </label>
                <button type="submit" className="save-btn" onClick={handleSubmitUpdates}>Save Changes</button>
            </form>
            <button className="close-modal" type="button" onClick={handleViewTaskModal}>
                <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
            </button>
        </dialog>   
    );
};

export default ViewTask;