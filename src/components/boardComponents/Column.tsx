import { useDroppable } from "@dnd-kit/core";

import Task from "./Task";

const Column = function({ col, setCurCol, setCreateTaskVis, setBoardsData }) {
    const { isOver, setNodeRef } = useDroppable({
        id: col._id
    });

    const tasksArr = col.tasks;
    const tasks = tasksArr.map(task => 
        <Task key={task._id} id={task._id} name={task.task} desc={task.desc} order={task.order} subtasks={task.subtasks} colId={col._id} setBoardsData={setBoardsData} />
    );

    // sets the id of the current column so that the new task will be created under the right column, and toggles CreateTask visibility
    function displayTask(colId) {
        setCurCol(colId);
        setCreateTaskVis(true);
    };

    return (
        <section ref={setNodeRef} className="column" key={col._id}>
            <h2>{col.name}</h2>
            {tasks}
            <button type="button" onClick={() => displayTask(col._id)}>+ Add New Task</button>
        </section>
    );
};

export default Column;