import { useContext, useState } from "react";
import { BoardsContext, CurBoardIdContext } from "../../Context";

import Column from "./Column";
import CreateTask from "../crudComponents/CreateTask";
import EditBoard from "../crudComponents/EditBoard";

const Board = function({ setBoardsData, setCurBoardId }) {
    const [ createTaskVis, setCreateTaskVis ] = useState(false);
    const [ curCol, setCurCol ] = useState();
    const [ editBoardVis, setEditBoardVis ] = useState(false);

    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);

    // sets the id of the current column so that the new task will be created under the right column, and toggles CreateTask visibility
    function displayTask(colId) {
        setCurCol(colId);
        setCreateTaskVis(true);
    };

    // filtering and rendering columns w/ their tasks
    function filterColumns() {
        const curBoard = boardsData.find(board => board._id === curBoardId);
        return curBoard.columns;
    };
    const columnsArr = filterColumns();
    const columns = columnsArr.map(col => 
        <Column key={col._id} col={col} setCreateTaskVis={setCreateTaskVis} setCurCol={setCurCol} setBoardsData={setBoardsData} />
    );

    return (
        <main>
            {columns}
            {createTaskVis ?
                <CreateTask curCol={curCol} columnsArr={columnsArr} setBoardsData={setBoardsData} setCreateTaskVis={setCreateTaskVis} /> : <></>
            }
            <button type="button" onClick={() => setEditBoardVis(true)}>+ Add New Column</button>
            {editBoardVis ?
                <EditBoard setBoardsData={setBoardsData} setEditBoardVis={setEditBoardVis} setCurBoardId={setCurBoardId} /> : <></>
            }
        </main>
    );
};

export default Board;