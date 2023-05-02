import { useDroppable } from "@dnd-kit/core";

import Task from "./Task";
import DroppableSpace from "./DroppableSpace";

const Column = function({ col, setCurCol, setCreateTaskVis, setBoardsData }) {
    const items = [
        `${col._id}0`,
        `${col._id}1`,
        `${col._id}2`,
        `${col._id}3`,
        `${col._id}4`,
        `${col._id}5`,
        `${col._id}6`,
        `${col._id}7`,
        `${col._id}8`,
        `${col._id}9`,
    ];
    // each column is a droppable...
    const { isOver, setNodeRef } = useDroppable({ id: col._id });
    const style = isOver ? 
        {
            backgroundColor: "#E9EFFA",
            padding: "2rem 1rem 0 1rem"
        } : null;

    // but there are also droppable spaces, which consist of the joined column ID and order
    const tasksArr = col.tasks;
    const tasks = tasksArr.map((task, index) => 
        <div key={task._id}>
            <Task id={task._id} name={task.task} desc={task.desc} order={index} subtasks={task.subtasks} colId={col._id} setBoardsData={setBoardsData} />
            <DroppableSpace id={items[index + 1]} />
        </div>
    );

    // sets the id of the current column so that the new task will be created under the right column, and toggles CreateTask visibility
    function displayTask(colId) {
        setCurCol(colId);
        setCreateTaskVis(true);
    };

    return (
        <section style={style} ref={setNodeRef} className="column">
            <h2>{`${col.name} (${col.tasks.length})`}</h2>
            {(tasks.length > 0) ? <DroppableSpace id={items[0]} /> : null }
            {tasks}
            <button type="button" className="add-task-btn" onClick={() => displayTask(col._id)}>+ Add New Task</button>
        </section>
    );
};

export default Column;