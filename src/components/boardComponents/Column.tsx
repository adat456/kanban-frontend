import { useDroppable, useDraggable } from "@dnd-kit/core";

import Task from "./Task";

const Column = function({ col, order, setCurCol, setCreateTaskVis, setBoardsData }) {
    // each column is a droppable...
    const { isOver, setNodeRef } = useDroppable({ id: col._id });
    // const { attributes, listeners, transform } = useDraggable({
    //     // all of this data is sent to DndContext in Board.tsx to be processed by onDragStart (and onDragEnd)
    //     id: `col${col._id}`,
    //     data: { order }
    // });
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
            <DroppableSpace id={`${col._id}${index + 1}`} />
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
            {(tasks.length > 0) ? <DroppableSpace id={`${col._id}0`} /> : null }
            {tasks}
            <button type="button" className="add-task-btn" onClick={() => displayTask(col._id)}>+ New Task</button>
        </section>
    );
};

const DroppableSpace = function({ id }) {
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
        } : null;

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