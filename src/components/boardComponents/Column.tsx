import Task from "./Task";

const Column = function({ col, setCurCol, setCreateTaskVis, setBoardsData }) {
    const tasksArr = col.tasks;
    const tasks = tasksArr.map(task => 
        <Task key={task._id} id={task._id} name={task.task} desc={task.desc} order={task.order} subtasks={task.subtasks} colId={col._id} setBoardsData={setBoardsData} />
    );

    function displayTask(colId) {
        setCurCol(colId);
        setCreateTaskVis(true);
    };

    return (
        <section className="column" key={col._id}>
            <h2>{col.name}</h2>
            {tasks}
            <button type="button" onClick={() => displayTask(col._id)}>+ Add New Task</button>
        </section>
    );
};

export default Column;