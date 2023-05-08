import { useState, useContext } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";

const EditTask = function({ name, desc, subtasks, colId, taskId, setDisplayMsg }) {
    const [ task, setTask ] = useState(name);
    const [ errMsg, setErrMsg ] = useState("");
    const [ description, setDescription ] = useState(desc);
    const [ numSubtasks, setNumSubtasks ] = useState(subtasks.length);
    const [ extraSubtaskFields, setExtraSubtaskFields ] = useState([]);
    const [ formKey, setFormKey ] = useState(0);

    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);
    const curBoard = boardsData.find(board => (board._id === curBoardId));

    const existingSubtaskFields = subtasks.map((subtask, index) => {
        return (
            <label key={index} htmlFor={`subtask${index}`} className="subtask-label"><input type="text" name="subtasks" className="edit-subtasks" id={`subtask${index}`} data-id={subtask._id} defaultValue={subtask.subtask} /><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
        );
    });

    function handleAddSubtaskField() {
        setNumSubtasks(numSubtasks + 1);
        setExtraSubtaskFields(extraSubtaskFields => [...   extraSubtaskFields,
            <label key={numSubtasks} htmlFor={`subtask${numSubtasks}`}className="subtask-label"><input type="text" id={`subtask${numSubtasks}`} name="subtasks" className="edit-subtasks" /><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
        ]);
    };

    const colOptions = curBoard.columns.map(col => {
        return (
            <option key={col._id} value={col._id}>{col.name}</option>
        );
    });

    function handleChange(e) {
        const input = e.target;
        const field = e.target.getAttribute("id");

        if (field === "task") {
            // if there's an input at all 
            if (input.value !== "") { 
                // check that the task name is unique 
                let valid = true;
                curBoard.columns.forEach(col => {
                    col.tasks.forEach(task => {
                        if (task._id !== taskId && task.task.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
                    });
                }); 

                if (valid) {
                    setErrMsg(null);
                    input.setCustomValidity("");
                } else {
                    setErrMsg("Task name must be unique.");
                    input.setCustomValidity("Task name must be unique.");
                };
            };
            
            // if there's no input, throw err
            if (input.value === "") {
                setErrMsg("Field required.");
                input.setCustomValidity("");
            };

            setTask(input.value);
        };

        if (field === "description") setDescription(input.value);
    };

    function handleEditTaskModal() {
        const editTaskModal = document.querySelector(`#edit-task-modal-${taskId}`);
        editTaskModal.close();
        setFormKey(formKey + 1);
    };

    function handleDeleteTaskModal(action) {
        const deleteTaskModal = document.querySelector(`#delete-task-modal-${taskId}`);
        if (action === "show") deleteTaskModal?.showModal();
        if (action === "close") deleteTaskModal?.close();
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!errMsg) {
            let subtasks = [];      
            function pullSubtasks() {
                const subtaskArr = [...document.getElementsByClassName("edit-subtasks")];
                subtaskArr.forEach(subtask => {
                    subtasks.push({
                        subtask: subtask.value,
                        id: subtask.getAttribute("data-id"),
                    });
                });
            };
            pullSubtasks();

            const selElement = document.getElementById("column");
            const updatedColId = selElement.value;

            const reqOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({  
                    boardId: curBoardId,
                    colId, 
                    taskId,
                    task,
                    desc: description,
                    updatedSubtasks: subtasks,
                    updatedColId
                }),
                credentials: "include"
            };

            try {
                const res = await fetch("http://localhost:3000/edit-task", reqOptions);
                if (res.ok) {
                    handleDisplayMsg({ok: true, message: "Task updated.", msgSetter: setDisplayMsg});

                    const updatedBoard = await res.json();
                    console.log(updatedBoard);

                    let updatedBoardsData = boardsData.filter(board => {
                        return (board._id !== curBoardId);
                    })
                    updatedBoardsData.push(updatedBoard);
                    setBoardsData(updatedBoardsData);

                    handleEditTaskModal();
                } else {
                    throw new Error("Failed to update task. Please try again later.");
                };
            } catch(err) {
                handleDisplayMsg({ok: false, message: err.message, msgSetter: setDisplayMsg});
            };
        } else {
            handleDisplayMsg({ok: false, message: "Please fix errors before submitting.", msgSetter: setDisplayMsg});
        };
    };

    async function handleDelete() {
        try {
            const res = await fetch(`http://localhost:3000/delete-task/${curBoardId}/${colId}/${taskId}`, { method: "DELETE", credentials: "include" });;
            if (res.ok) {
                handleDisplayMsg({ok: true, message: "Task deleted.", msgSetter: setDisplayMsg});

                const updatedBoard = await res.json();
                let updatedBoardsData = boardsData.filter(board => {
                    return (board._id !== curBoardId);
                })
                updatedBoardsData.push(updatedBoard);
                setBoardsData(updatedBoardsData);

                handleDeleteTaskModal("close");
            } else {
                throw new Error("Unable to delete task.");
            };
        } catch(err) {
            handleDisplayMsg({ok: false, message: err.message, msgSetter: setDisplayMsg});
        };
    };

    return (
        <>
            <dialog key={formKey} className="form-modal" id={`edit-task-modal-${taskId}`}>
                <form method="POST" className="edit-task" onSubmit={handleSubmit} noValidate>
                    <h2>Edit Task</h2>
                    <label htmlFor="task">Title</label>
                    <input type="text" id="task" name="task" defaultValue={name} onChange={handleChange} maxLength="30" required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    <label htmlFor="description">Description<textarea id="description" name="description" value={description} onChange={handleChange} rows="5" maxLength="200" /></label>
                    <fieldset>
                        <legend>Subtasks</legend>
                        {existingSubtaskFields}
                        {extraSubtaskFields}
                        <button type="button" className="add-btn" onClick={handleAddSubtaskField}>+ Add New Subtask</button>
                    </fieldset>
                    <label htmlFor="column">Column
                        <select name="column" id="column" defaultValue={colId}>
                            {colOptions}
                        </select>
                    </label>
                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="delete-btn" onClick={() => {handleEditTaskModal(); handleDeleteTaskModal("show")}}>Delete Task</button>
                    <button className="close-modal" type="button" onClick={handleEditTaskModal}>
                        <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                    </button>
                </form>
            </dialog>
            <dialog className="delete-modal" id={`delete-task-modal-${taskId}`}>
                <h2>Delete this task?</h2>
                <p>{`Are you sure you want to delete the '${name}' task and its subtasks? This action cannot be reversed.`}</p>
                <div className="delete-btn-cluster">
                    <button type="button" onClick={handleDelete} className="delete-btn">Delete</button>
                    <button type="button" onClick={() => handleDeleteTaskModal("close")} className="add-btn">Cancel</button>
                </div>
            </dialog>
        </>
    );
};

export default EditTask;