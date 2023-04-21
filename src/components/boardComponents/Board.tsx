import { useContext, useEffect } from "react";
import { BoardsContext, CurBoardIdContext } from "../../Context";

import Task from "./Task";

const Board = function({ setBoardsData }) {
    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);

    function filterColumns() {
        const curBoard = boardsData.find(board => board._id === curBoardId);
        return curBoard.columns;
    }
    const columnsArr = filterColumns();
    const columns = columnsArr.map(col => {

        const tasksArr = col.tasks;
        const tasks = tasksArr.map(task => 
            <Task key={task._id} id={task._id} name={task.task} desc={task.desc} order={task.order} subtasks={task.subtasks} />
        );

        return (
            <section className="column" key={col._id}>
                <h3>{col.name}</h3>
                {tasks}
                <button type="button">+ Add New Task</button>
            </section>
        );
    })

    return (
        <main>
            {columns}
            <button type="button">+ Add New Column</button>
        </main>
    );
};

export default Board;