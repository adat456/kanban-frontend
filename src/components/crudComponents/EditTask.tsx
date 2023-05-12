import { useState, useContext, useRef } from "react";

import { BoardsContext, CurBoardIdContext, subtaskData } from "../../Context";
import { handleDisplayMsg } from "../helpers";
import Fields from "./Fields";

interface Prop {
    name: string,
    desc: string,
    subtasks: subtaskData[],
    colId: string,
    taskId: string,
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    setEditTaskVis: React.Dispatch<React.SetStateAction<boolean>>
};

const EditTask: React.FC<Prop> = function({ name, desc, subtasks, colId, taskId, setDisplayMsg, setEditTaskVis }) {
    const [ task, setTask ] = useState(name);
    const [ errMsg, setErrMsg ] = useState("");
    const [ description, setDescription ] = useState(desc);
    const [ subtaskValues, setSubtaskValues ] = useState(subtasks.map(subtask => { return {id: subtask._id, value: subtask.subtask}}));
    const [ subtasksTBD, setSubtasksTBD ] = useState([]);
    const [ updatedColId, setUpdatedColId ] = useState(colId);

    const counterRef = useRef(subtaskValues.length);

    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);
    const curBoard = boardsData?.find(board => (board._id === curBoardId));

    const colOptions = curBoard?.columns.map(col => {
        return (
            <option key={col._id} value={col._id}>{col.name}</option>
        );
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
        const input = e.target;
        const field = e.target.getAttribute("id");

        if (field === "task") {
            // if there's an input at all 
            if (input.value !== "") { 
                // check that the task name is unique 
                let valid = true;
                curBoard?.columns.forEach(col => {
                    col.tasks.forEach(task => {
                        if (task._id !== taskId && task.task.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
                    });
                }); 

                if (valid) {
                    setErrMsg("");
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
        const editTaskModal: HTMLDialogElement | null = document.querySelector(".edit-task-modal");
        editTaskModal?.close();
        
        setEditTaskVis(false);
    };

    function handleDeleteTaskModal(action: string) {
        const deleteTaskModal: HTMLDialogElement | null = document.querySelector(`#delete-task-modal`);
        if (action === "show") {
            const editTaskModal: HTMLDialogElement | null = document.querySelector(".edit-task-modal");
            editTaskModal?.close();
            deleteTaskModal?.showModal();
        };
        if (action === "close") {
            deleteTaskModal?.close();
            setEditTaskVis(false);
        };
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!errMsg) {
            let subtasks: {name: string, id: string, status: boolean}[] = [];     
            subtaskValues.forEach(subtask => {
                if (subtask.value) subtasks.push({ name: subtask.value, id: subtask.id, status: false })
            });

            const reqOptions: RequestInit = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({  
                    boardId: curBoardId,
                    colId, 
                    taskId,
                    task,
                    desc: description,
                    updatedSubtasks: [...subtasks, ...subtasksTBD],
                    updatedColId
                }),
                credentials: "include"
            };

            try {
                const res = await fetch("http://localhost:3000/edit-task", reqOptions);
                if (res.ok) {
                    handleDisplayMsg({ok: true, message: "Task updated.", msgSetter: setDisplayMsg});

                    const updatedBoard = await res.json();
                    let updatedBoardsData = boardsData?.filter(board => {
                        return (board._id !== curBoardId);
                    })
                    if (updatedBoardsData) {
                        updatedBoardsData.push(updatedBoard);
                        setBoardsData(updatedBoardsData);
                    };

                    handleEditTaskModal(taskId);
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
                let updatedBoardsData = boardsData?.filter(board => {
                    return (board._id !== curBoardId);
                });
                if (updatedBoardsData) {
                    updatedBoardsData.push(updatedBoard);
                    setBoardsData(updatedBoardsData);
                };
                
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
            <dialog className="form-modal edit-task-modal">
                <form method="POST" className="edit-task" onSubmit={handleSubmit} noValidate>
                    <h2>Edit Task</h2>
                    <label htmlFor="task">Title</label>
                    <input type="text" id="task" name="task" defaultValue={name} onChange={handleChange} maxLength={30} required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={description} onChange={handleChange} rows={5} maxLength={200} />
                    <Fields type="subtask" values={subtaskValues} setValues={setSubtaskValues} counterRef={counterRef} valuesTBD={subtasksTBD} setValuesTBD={setSubtasksTBD} />
                    <label htmlFor="column">Column</label>
                    <select name="column" id="column" defaultValue={colId} onChange={(e) => setUpdatedColId(e.target.value)} >
                        {colOptions}
                    </select>
                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteTaskModal("show")}>Delete Task</button>
                    <button className="close-modal" type="button" onClick={handleEditTaskModal}>
                        <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                    </button>
                </form>
            </dialog>
            <dialog className="delete-modal" id="delete-task-modal">
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