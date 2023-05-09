import { useState, useContext, useRef } from "react";
import { BoardsContext, CurBoardIdContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";
import Fields from "./Fields";

const CreateTask = function({ curCol, columnsArr, setDisplayMsg, subtaskValues, setSubtaskValues }) {
    const [ task, setTask ] = useState("");
    const [ errMsg, setErrMsg ] = useState("Field required.");
    const [ desc, setDesc ] = useState("");
    
    const counterRef = useRef(3);
    // https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/?utm_source=pocket_saves#keys-and-reconciliation
    const [ formKey, setFormKey ] = useState(0);

    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);
    const curBoard = boardsData.find(board => board._id === curBoardId);

    const colOptions = columnsArr.map(col => {
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
                        if (task.task.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
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

        if (field === "desc") setDesc(input.value);
    };

    function handleCreateTaskModal() {
        const createTaskModal = document.querySelector("#create-task-modal");
        createTaskModal.close();
        // part of clearing stale state
        setFormKey(formKey + 1);
        setErrMsg("Field required.");
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!errMsg) {
            // get subtasks and format in arr
            let subtasks = [];      
            subtaskValues.forEach(subtask => {
                if (subtask.value) {
                    subtasks.push({
                        subtask: subtask.value,
                        status: false,
                    });
                };
            });

            // get id of column that task will be assigned to
            const selElement = document.getElementById("column");
            const columnId = selElement.value;

            // get order of task based on number of existing tasks in that column
            let numTasksinCol;
            curBoard.columns.forEach(col => {
                if (col._id === columnId) {
                    numTasksinCol = col.tasks.length;
                };
            });

            const reqOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ 
                    boardId: curBoardId, 
                    columnId, 
                    task, 
                    order: numTasksinCol,
                    desc, 
                    subtasks
                }),
                credentials: "include"
            };
            
            try {
                const res = await fetch("http://localhost:3000/create-task", reqOptions);
                if (res.ok) {
                    handleDisplayMsg({
                        ok: true,
                        message: "Task created.",
                        msgSetter: setDisplayMsg
                    });
                    // update context as well, with board ID
                    const res = await fetch(`http://localhost:3000/read-board/${curBoardId}`, {credentials: "include"});
                    const updatedMongoBoard = await res.json();
                    console.log(updatedMongoBoard);
                    // remove current board and replace it with the updated board in context
                    const filteredBoardsData = boardsData.filter(board => {
                        return (board._id !== curBoardId);
                    })
                    setBoardsData([...filteredBoardsData, updatedMongoBoard]);

                    handleCreateTaskModal();
                } else {
                    // client-generated error message
                    throw new Error("Failed to create board. Please try again later.");
                };
            } catch(err) {
                handleDisplayMsg({
                    ok: false,
                    message: err.message,
                    msgSetter: setDisplayMsg
                });
            };
            // close out window/modal
        } else {
            handleDisplayMsg({
                ok: false,
                message: "Please fix errors before submitting.",
                msgSetter: setDisplayMsg
            });
        }
    };

    return (
        <>
            <dialog key={formKey} className="form-modal" id="create-task-modal">
                <form method="POST" onSubmit={handleSubmit} noValidate>
                    <h2>Add New Task</h2>
                    <label htmlFor="task">Title</label>
                    <input type="text" id="task" name="task" onChange={handleChange} placeholder="e.g., Take coffee break" maxLength="30" required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    <label htmlFor="desc">Description<textarea rows="5" id="desc" name="desc" onChange={handleChange} placeholder="e.g., It's always good to take a break. his 15 minute break will recharge the batteries a little." maxLength="200" /></label>
                    <Fields type="subtask" values={subtaskValues} setValues={setSubtaskValues} counterRef={counterRef} />
                    <label htmlFor="column">Column
                        <select name="column" id="column" defaultValue={curCol}>
                            {colOptions}
                        </select>
                    </label>
                    <button type="submit" className="save-btn">Create Task</button>
                </form>
                <button className="close-modal" type="button" onClick={handleCreateTaskModal}>
                    <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                </button>
            </dialog>
        </>
    );
};

export default CreateTask;

