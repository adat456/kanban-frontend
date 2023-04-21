const Task = function({ name, desc, order, subtasks }) {
    return (
        <div className="task">
            <p>{name}</p>
        </div>
    );
};

export default Task;