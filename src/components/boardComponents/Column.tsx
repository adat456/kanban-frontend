import { useState } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";

import { columnData } from "../../Context";
import CreateTask from "../crudComponents/CreateTask";
import Task from "./Task";

interface Prop {
    col: columnData,
    columnsArr: columnData[],
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>
};

const Column: React.FC<Prop> = function({ col, columnsArr, setDisplayMsg }) {
    const [ curCol, setCurCol ] = useState("");

    // each column is a droppable...
    const { isOver, setNodeRef } = useDroppable({ id: col._id });
    const style = isOver ? 
        {
            backgroundColor: "#E9EFFA",
            padding: "2rem 1rem 0 1rem"
        } : undefined;

    // but there are also droppable spaces, which consist of the joined column ID and order
    const tasksArr = col.tasks;
    const tasks = tasksArr.map((task, index) => 
        <div key={task._id}>
            <Task id={task._id} name={task.task} desc={task.desc} order={index} subtasks={task.subtasks} colId={col._id} setDisplayMsg={setDisplayMsg} />
            <DroppableSpace id={`${col._id}${index + 1}`} />
        </div>
    );

    const [ subtaskValues, setSubtaskValues ] = useState([
        { id: "1", value: "" },
        { id: "2", value: "" },
    ]);
    // sets the id of the current column so that the new task will be created under the right column, and toggles CreateTask visibility
    function displayTask(colId: string) {
        setCurCol(colId);
        const createTaskModal: HTMLDialogElement | null = document.querySelector("#create-task-modal");
        createTaskModal?.showModal();
        setSubtaskValues([
            { id: "1", value: "" },
            { id: "2", value: "" },
        ]);
    };

    return (
        <section style={style} ref={setNodeRef} className="column">
            <h2>{`${col.name} (${col.tasks.length})`}</h2>
            {(tasks.length > 0) ? <DroppableSpace id={`${col._id}0`} /> : null }
            {tasks}
            <button type="button" className="add-task-btn" onClick={() => displayTask(col._id)}>+ New Task</button>
            <CreateTask curCol={curCol} columnsArr={columnsArr} setDisplayMsg={setDisplayMsg} subtaskValues={subtaskValues} setSubtaskValues={setSubtaskValues} />
        </section>
    );
};

const DroppableSpace: React.FC<{id: string}> = function({ id }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    // style (making the droppable space/line visible) is only applied when the task/droppable is over the element
    const lineStyle = isOver ? 
        {
            backgroundColor: "#E4EBFA",
            width: "100%",
            height: "2px",
            margin: "2rem 0",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center"
        } : undefined;

    const numStyle = isOver ?
        {
            backgroundColor: "#E4EBFA",
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        } : 
        {
            display: "none"
        };

    return (
        <div ref={setNodeRef} style={lineStyle} className="droppable-task-space">
            <div style={numStyle}>{Number(id.slice(-1)) + 1}</div>
        </div>
    );
};

export default Column;