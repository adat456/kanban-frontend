import { useState, useContext } from "react";

import ViewTask from "../crudComponents/ViewTask";
// import { BoardsContext, CurBoardIdContext } from "../../Context";

const Task = function({ id, name, desc, order, subtasks, colId, setBoardsData }) {
    const [ viewTaskVis, setViewTaskVis ] = useState(false);
    const [ editTaskVis, setEditTaskVis ] = useState(false);
    const [ deleteTaskVis, setDeleteTaskVis ] = useState(false);

    // const boardsData = useContext(BoardsContext);
    // const curBoardId = useContext(CurBoardIdContext);
    // let colName;
    // boardsData.forEach(board => {
    //     if (board._id === curBoardId) {
    //         board.columns.forEach(col => {
    //             if (col._id === colId) colName = col.name;
    //         });
    //     };
    // });

    return (
        <>
            <div className="task" onClick={() => {setViewTaskVis(true)}}>
                <h3>{name}</h3>
            </div>
            {viewTaskVis ?
                <ViewTask name={name} desc={desc} subtasks={subtasks} colId={colId} taskId={id} setViewTaskVis={setViewTaskVis} setBoardsData={setBoardsData} /> : <></>
            }
        </>
    );
};

export default Task;