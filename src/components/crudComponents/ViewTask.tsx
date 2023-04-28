import { useContext, useState } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";

const ViewTask = function({ name, desc, subtasks, colId, taskId, setViewTaskVis, setBoardsData, setEditTaskVis }) {
    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);
    
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
                const updatedBoard = await res.json();
                console.log(updatedBoard);

                let updatedBoardsData = boardsData.filter(board => {
                    return (board._id !== curBoardId);
                })
                updatedBoardsData.push(updatedBoard);
                setBoardsData(updatedBoardsData);

                setViewTaskVis(false);
            } else {
                throw new Error("Unable to update this task.");
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <form method="POST" className="view-task">
            <div className="view-task-header">
                <h2>{name}</h2>
                <button type="button" onClick={() => {setEditTaskVis(true); setViewTaskVis(false);}}><svg viewBox="0 0 5 20" width="5" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="#828FA3" fillRule="evenodd"><circle cx="2.308" cy="2.308" r="2.308"/><circle cx="2.308" cy="10" r="2.308"/><circle cx="2.308" cy="17.692" r="2.308"/></g></svg></button>
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
    );
};

export default ViewTask;