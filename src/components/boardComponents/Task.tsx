import { useState, useContext } from "react";

import ViewTask from "../crudComponents/ViewTask";
import EditTask from "../crudComponents/EditTask";

const Task = function({ id, name, desc, order, subtasks, colId, setBoardsData }) {
    const [ viewTaskVis, setViewTaskVis ] = useState(false);
    const [ editTaskVis, setEditTaskVis ] = useState(false);

    return (
        <>
            <div className="task" onClick={() => {setViewTaskVis(true)}}>
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