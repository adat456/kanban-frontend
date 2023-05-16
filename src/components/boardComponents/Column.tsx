import { useEffect, useState } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";

import { columnData } from "../../Context";
import CreateTask from "../crudComponents/CreateTask";
import Task from "./Task";

interface Prop {
    col: columnData,
    columnsArr: columnData[],
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    curUserStatus: string
};

const Column: React.FC<Prop> = function({ col, columnsArr, setDisplayMsg, curUserStatus }) {
    const [ createTaskVis, setCreateTaskVis ] = useState(false);

    useEffect(() => {
        if (createTaskVis) {
            const createTaskModal: HTMLDialogElement | null = document.querySelector("#create-task-modal");
            createTaskModal?.showModal();
        };
    }, [createTaskVis]);

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
            <Task id={task._id} name={task.task} desc={task.desc} order={index} subtasks={task.subtasks} colId={col._id} setDisplayMsg={setDisplayMsg} curUserStatus={curUserStatus} />
            <DroppableSpace id={`${col._id}${index + 1}`} />
        </div>
    );

    return (
        <section style={style} ref={setNodeRef} className="column">
            <h2>{`${col.name} (${col.tasks.length})`}</h2>
            {(tasks.length > 0) ? <DroppableSpace id={`${col._id}0`} /> : null }
            {tasks}
            {(curUserStatus === "Creator" || curUserStatus === "Co-creator") ?
                <>
                    <button type="button" className="add-task-btn" onClick={() => setCreateTaskVis(true)}>+ New Task</button>
                    {createTaskVis? <CreateTask setCreateTaskVis={setCreateTaskVis} curCol={col._id} columnsArr={columnsArr} setDisplayMsg={setDisplayMsg} /> : null }
                </>
                : null
            }
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