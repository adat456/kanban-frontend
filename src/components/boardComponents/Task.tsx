import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import ViewTask from "../crudComponents/ViewTask";
import EditTask from "../crudComponents/EditTask";

const Task = function({ id, name, desc, order, subtasks, colId, setBoardsData }) {
    const [ viewTaskVis, setViewTaskVis ] = useState(false);
    const [ editTaskVis, setEditTaskVis ] = useState(false);

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data: { colId }
    });

    const style = {
        zIndex: 1,
        transform: CSS.Translate.toString(transform),
    };

    return (
        <>
            <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="task" onClick={() => {setViewTaskVis(true)}}>
                <h3>{name}</h3>
            </div>
            {viewTaskVis ?
                <ViewTask name={name} desc={desc} subtasks={subtasks} colId={colId} taskId={id} setViewTaskVis={setViewTaskVis} setBoardsData={setBoardsData} setEditTaskVis={setEditTaskVis} /> : <></>
            }
            {editTaskVis ?
                <EditTask name={name} desc={desc} subtasks={subtasks} colId={colId} taskId={id} setEditTaskVis={setEditTaskVis} setBoardsData={setBoardsData} /> : <></>
            }
        </>
    );
};

export default Task;