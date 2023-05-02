import { useState, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import ViewTask from "../crudComponents/ViewTask";
import EditTask from "../crudComponents/EditTask";

const Task = function({ id, name, desc, order, subtasks, colId, setBoardsData }) {
    const [ viewTaskVis, setViewTaskVis ] = useState(false);
    const [ editTaskVis, setEditTaskVis ] = useState(false);
    const dragHandleRef = useRef(null);

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        // all of this data is sent to DndContext in Board.tsx to be processed by onDragStart (and onDragEnd)
        id,
        data: {
            order,
            colId
        }
    });

    let numCompleteSubtasks = 0;
    if (subtasks) {
        subtasks.forEach(subtask => {
            if (subtask.status) numCompleteSubtasks++;;
        });
    };

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    function handleDragHandleVis(boolean) {
        if (boolean) {
            dragHandleRef.current.classList.remove("hidden");
            dragHandleRef.current.classList.add("dragHandle");
        };
        if (!boolean) {
            dragHandleRef.current.classList.add("hidden");
            dragHandleRef.current.classList.remove("dragHandle");
        };
    };

    return (
        <>
            <div ref={setNodeRef} style={style} className="task" onMouseEnter={() => handleDragHandleVis(true)} onMouseLeave={() => handleDragHandleVis(false)} onClick={() => {setViewTaskVis(true)}}>
                <div className="task-brief">
                    <h3>{name}</h3>
                    {subtasks ? 
                        <p>{`${numCompleteSubtasks} of ${subtasks.length} subtasks`}</p> : <></>
                    }
                </div>
                <div className="hidden" ref={dragHandleRef} {...listeners} {...attributes}>
                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="#828FA3" stroke="#828FA3"><g id="SVGRepo_bgCarrier" strokeWidth="0"/><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"/><g id="SVGRepo_iconCarrier"><path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" fill="#828FA3"/></g></svg>
                </div>
            </div>
            {viewTaskVis ?
                <>
                    <ViewTask name={name} desc={desc} subtasks={subtasks} colId={colId} taskId={id} setViewTaskVis={setViewTaskVis} setBoardsData={setBoardsData} setEditTaskVis={setEditTaskVis} /> 
                    <div className="backdrop" onClick={() => setViewTaskVis(false)} />
                </>: <></>
            }
            {editTaskVis ?
                <>
                    <EditTask name={name} desc={desc} subtasks={subtasks} colId={colId} taskId={id} setEditTaskVis={setEditTaskVis} setBoardsData={setBoardsData} />
                    <div className="backdrop" onClick={() => setEditTaskVis(false)} />
                </> : null
            }
        </>
    );
};

export default Task;