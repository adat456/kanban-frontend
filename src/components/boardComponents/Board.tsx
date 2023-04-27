import { useContext, useState, useRef } from "react";
import { DndContext } from "@dnd-kit/core";

import { BoardsContext, CurBoardIdContext } from "../../Context";

import Column from "./Column";
import CreateTask from "../crudComponents/CreateTask";
import EditBoard from "../crudComponents/EditBoard";

const Board = function({ setBoardsData, setCurBoardId }) {
    const [ createTaskVis, setCreateTaskVis ] = useState(false);
    const [ curCol, setCurCol ] = useState();
    const [ editBoardVis, setEditBoardVis ] = useState(false);

    const initialColId = useRef("");
    const taskId = useRef("");

    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);
    const curBoard = boardsData.find(board => board._id === curBoardId);

    // sets the id of the current column so that the new task will be created under the right column, and toggles CreateTask visibility
    function displayTask(colId) {
        setCurCol(colId);
        setCreateTaskVis(true);
    };

    // rendering columns w/ their tasks
    const columns = curBoard.columns.map(col => 
        <Column key={col._id} col={col} setCreateTaskVis={setCreateTaskVis} setCurCol={setCurCol} setBoardsData={setBoardsData} />
    );

    function handleDragStart(e) {
        // can access the id of the draggable 
        taskId.current = e.active.id;
        // can access data IN the draggable with e.active.data.current.<key>
        initialColId.current = e.active.data.current.colId;
    };

    async function handleDragEnd(e) {
        try {
            // e.over.id is the unique id of the DROPPABLE in this handler
            if (e.over && (e.over.id !== initialColId.current)) { 
                console.log("New column");

                const reqOptions = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({  
                        boardId: curBoardId,
                        colId: initialColId.current,
                        taskId: taskId.current,
                        updatedColId: e.over.id
                    }),
                    credentials: "include"
                };

                const res = await fetch("http://localhost:3000/update-task", reqOptions);
                if (res.ok) {
                    const updatedBoard = await res.json();
                    console.log(updatedBoard);

                    let updatedBoardsData = boardsData.filter(board => {
                        return (board._id !== curBoardId);
                    })
                    updatedBoardsData.push(updatedBoard);
                    setBoardsData(updatedBoardsData);

                } else {
                    throw new Error("Unable to update this task.");
                };
            } else {
                console.log("Column has not changed.");
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <main>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {columns}
                {createTaskVis ?
                    <CreateTask curCol={curCol} columnsArr={columnsArr} setBoardsData={setBoardsData} setCreateTaskVis={setCreateTaskVis} /> : <></>
                }
                <button type="button" onClick={() => setEditBoardVis(true)}>+ Add New Column</button>
                {editBoardVis ?
                    <EditBoard setBoardsData={setBoardsData} setEditBoardVis={setEditBoardVis} setCurBoardId={setCurBoardId} /> : <></>
                }
            </DndContext>
        </main>
    );
};

export default Board;