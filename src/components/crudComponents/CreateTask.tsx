import { useState, useContext, useEffect, useRef } from "react";
import { BoardsContext, CurBoardIdContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";

const CreateTask = function({ curCol, columnsArr, setDisplayMsg }) {
    const [ task, setTask ] = useState("");
    const [ errMsg, setErrMsg ] = useState("Field required.");
    const [ desc, setDesc ] = useState("");
    // TRIAL
    const [ subtaskValues, setSubtaskValues ] = useState({
        subtask1: {
            id: 1,
            value: "",
        },
        subtask2: {
            id: 2,
            value: "",
        },
    });
    const counterRef = useRef(3);
    const [ subtaskFields, setSubtaskFields ] = useState([]);
    // const [ numSubtasks, setNumSubtasks ] = useState(2);
    // const [ extraSubtaskFields, setExtraSubtaskFields ] = useState([]);

    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);
    const curBoard = boardsData.find(board => board._id === curBoardId);

    const colOptions = columnsArr.map(col => {
        return (
            <option key={col._id} value={col._id}>{col.name}</option>
        );
    });

    // TRIAL
    useEffect(() => {    
        const subtasks = Object.values(subtaskValues);
        console.log(subtasks);
        const subtaskFieldsArr = subtasks.map(subtask => {
            return (
                <label key={subtask.id} htmlFor={`subtask${subtask.id}`}className="subtask-label">
                    <input type="text" data-id={subtask.id} id={`subtask${subtask.id}`} value={subtask.value} onChange={handleSubtaskFieldChange} name="subtasks" className="create-subtasks" maxLength="50" />
                    <button type="button" data-id={subtask.id} onClick={handleSubtaskFieldRemoval}>
                        <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                    </button>
                </label>
            );
        });

        setSubtaskFields(subtaskFieldsArr);
    }, [subtaskValues]);

    function handleSubtaskFieldChange(e) {
        const subtaskId = e.target.getAttribute("data-id");
        
        const subtaskValuesCopy = subtaskValues;
        subtaskValuesCopy[`subtask${subtaskId}`].value = e.target.value;
        console.log(subtaskValuesCopy);
        setSubtaskValues(subtaskValuesCopy);
    };

    function handleSubtaskFieldRemoval(e) {
        // const subtaskField = e.target;
        // const subtaskId = subtaskField.getAttribute("data-id");

        // const filteredSubtaskValues = subtaskValues.filter(subtask => {
        //     return (subtask.id !== subtaskId);
        // });
        // setSubtaskValues(filteredSubtaskValues);
    };

    function handleAddSubtaskField() {
        
    };
    // function handleAddSubtaskField() {
    //     // this first setState call will not click in until the next click, which is why the initial value is 2 instead of 1 (0-indexed)
    //     setNumSubtasks(numSubtasks + 1);
    //     setExtraSubtaskFields(extraSubtaskFields => [...extraSubtaskFields,
    //         <label key={numSubtasks} htmlFor={`subtask${numSubtasks}`}className="subtask-label"><input type="text" id={`subtask${numSubtasks}`} name="subtasks" className="create-subtasks" maxLength="50" /><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
    //     ]);
    // };

    function handleChange(e) {
        const input = e.target;
        const field = e.target.getAttribute("id");

        if (field === "task") {
            setTask(input.value);

            let valid = true;
            curBoard.columns.forEach(col => {
                col.tasks.forEach(task => {
                    if (task.task.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
                });
            });          
            if (!valid) {
                setErrMsg("Task name must be unique.");
                input.setCustomValidity("Task name must be unique.");
            } else {
                setErrMsg(null);
                input.setCustomValidity("");
            };
        };

        if (field === "desc") setDesc(input.value);
    };

    useEffect(() => {
        if (task === "") setErrMsg("Field required.");
    }, [task]);

    function handleCreateTaskModal() {
        const createTaskModal = document.querySelector("#create-task-modal");
        createTaskModal.close();
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!errMsg) {
            // get subtasks and format in arr
            let subtasks = [];      
            function pullSubtaskNames() {
                const subtaskArr = [...document.getElementsByClassName("create-subtasks")];
                subtaskArr.forEach(subtask => {
                    if (subtask.value) {
                        subtasks.push({
                            subtask: subtask.value,
                            status: false,
                        });
                    };
                });
            };
            pullSubtaskNames();

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
            <dialog className="form-modal" id="create-task-modal">
                <form method="POST" onSubmit={handleSubmit} noValidate>
                    <h2>Add New Task</h2>
                    <label htmlFor="task">Title</label>
                    <input type="text" id="task" name="task" onChange={handleChange} placeholder="e.g., Take coffee break" maxLength="30" required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    <label htmlFor="desc">Description<textarea rows="5" id="desc" name="desc" onChange={handleChange} placeholder="e.g., It's always good to take a break. his 15 minute break will recharge the batteries a little." maxLength="200" /></label>
                    <fieldset>
                        <legend>Subtasks</legend>
                        {/* TRIAL */}
                        {subtaskFields}
                        {/* <label htmlFor="subtask0" className="subtask-label"><input type="text" id="subtask0" name="subtasks" className="create-subtasks" placeholder="e.g., Make coffee" maxLength="50" /><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
                        <label htmlFor="subtask1" className="subtask-label"><input type="text" id="subtask1" name="subtasks" className="create-subtasks" placeholder="e.g., Drink coffee and smile" maxLength="50" /><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
                        {extraSubtaskFields} */}
                        <button type="button" className="add-btn" onClick={handleAddSubtaskField}>+ Add New Subtask</button>
                    </fieldset>
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

