import { useState, useContext } from "react";
import { BoardsContext, CurBoardIdContext } from "../../Context";

const CreateTask = function({ curCol, columnsArr, setBoardsData, setCreateTaskVis }) {
    const [ task, setTask ] = useState("");
    const [ desc, setDesc ] = useState("");
    const [ numSubtasks, setNumSubtasks ] = useState(2);
    const [ extraSubtaskFields, setExtraSubtaskFields ] = useState([]);

    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);
    const curBoard = boardsData.find(board => board._id === curBoardId);

    const colOptions = columnsArr.map(col => {
        return (
            <option key={col._id} value={col._id}>{col.name}</option>
        );
    });

    function handleAddSubtaskField() {
        // this first setState call will not click in until the next click, which is why the initial value is 2 instead of 1 (0-indexed)
        setNumSubtasks(numSubtasks + 1);
        setExtraSubtaskFields(extraSubtaskFields => [...extraSubtaskFields,
            <label key={numSubtasks} htmlFor={`subtask${numSubtasks}`}><input type="text" id={`subtask${numSubtasks}`} name="subtasks" className="create-subtasks" /></label>
        ]);
    };

    function handleChange(e) {
        const input = e.target;
        const field = e.target.getAttribute("id");

        if (field === "task") setTask(input.value);
        if (field === "desc") setDesc(input.value);
    };

    async function handleSubmit(e) {
        e.preventDefault();

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
            const message = await res.json();
            // this will print any messages (success or error) received from the server
            console.log(message);
            if (res.ok) {
                // update context as well, with board ID
                const res = await fetch(`http://localhost:3000/read-board/${curBoardId}`, {credentials: "include"});
                const updatedMongoBoard = await res.json();
                // remove current board and replace it with the updated board in context
                const filteredBoardsData = boardsData.filter(board => {
                    return (board._id !== curBoardId);
                })
                setBoardsData([...filteredBoardsData, updatedMongoBoard]);

                setCreateTaskVis(false);
            } else {
                // client-generated error message
                throw new Error("Failed to create board. Please try again later.");
            };
        } catch(err) {
            console.log(err.message);
        };
        // close out window/modal
    };

    return (
        <form method="POST" className="create-task" onSubmit={handleSubmit}>
            <h2>Add New Task</h2>
            <label htmlFor="task">Title<input type="text" id="task" name="task" onChange={handleChange} placeholder="e.g., Take coffee break" /></label>
            <label htmlFor="desc">Description<textarea rows="5" id="desc" name="desc" onChange={handleChange} placeholder="e.g., It's always good to take a break. his 15 minute break will recharge the batteries a little." /></label>
            <fieldset>
                <legend>Subtasks</legend>
                <label htmlFor="subtask0"><input type="text" id="subtask0" name="subtasks" className="create-subtasks" placeholder="e.g., Make coffee" /></label>
                <label htmlFor="subtask1"><input type="text" id="subtask1" name="subtasks" className="create-subtasks" placeholder="e.g., Drink coffee and smile" /></label>
                {extraSubtaskFields}
                <button type="button" className="add-btn" onClick={handleAddSubtaskField}>+ Add New Subtask</button>
            </fieldset>
            <label htmlFor="column">Column
                <select name="column" id="column" defaultValue={curCol}>
                    {colOptions}
                </select>
            </label>
            <button type="submit" className="save-btn">Create Task</button>
        </form>
    );
};

export default CreateTask;

