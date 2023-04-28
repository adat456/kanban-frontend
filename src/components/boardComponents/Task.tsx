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
        data: { name, colId }
    });

    let numCompleteSubtasks = 0;
    if (subtasks) {
        subtasks.forEach(subtask => {
            if (subtask.status) numCompleteSubtasks++;;
        });
    };
    
    function handleBackdrop() {
        if (viewTaskVis) setViewTaskVis(false);
        if (editTaskVis) setEditTaskVis(false);
    };

    // const style = {
    //     zIndex: 1,
    //     transform: CSS.Translate.toString(transform),
    // };

    return (
        <>
            {/* removed style={style} so that OG node will not move */}
            <div ref={setNodeRef} {...listeners} {...attributes} className="task" onClick={() => {setViewTaskVis(true)}}>
                <h3>{name}</h3>
                {subtasks ? 
                    <p>{`${numCompleteSubtasks} of ${subtasks.length} subtasks`}</p> : <></>
                }
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