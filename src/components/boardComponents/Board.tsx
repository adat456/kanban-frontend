import { useContext, useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

import { BoardsContext, CurBoardIdContext } from "../../Context";
import Column from "./Column";
import CreateTask from "../crudComponents/CreateTask";
import EditBoard from "../crudComponents/EditBoard";

const Board = function({ setBoardsData, setCurBoardId }) {
    const [ createTaskVis, setCreateTaskVis ] = useState(false);
    const [ curCol, setCurCol ] = useState();
    const [ editBoardVis, setEditBoardVis ] = useState(false);

    const [ draggableInfo, setDraggableInfo ] = useState({ 
        order: "", 
        taskId: "", 
        colId: ""
    });

    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);
    const curBoard = boardsData.find(board => board._id === curBoardId);
    const columnsArr = curBoard.columns;

    // rendering columns w/ their tasks
    const columns = columnsArr.map((col, index) => 
        <Column key={col._id} order={index} col={col} setCreateTaskVis={setCreateTaskVis} setCurCol={setCurCol} setBoardsData={setBoardsData} />
    );

    // although pointer sensor is one of the default sensors, I imported it with useSensor and useSensors to be passed along to DndContext so that an activation constraint could be added, and a simple click on a draggable opens the task preview instead of initiating a dragstart event
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            delay: 250, 
            tolerance: 10 
        },
    });
    const sensors = useSensors(pointerSensor);

    function handleDragStart(e) {
        setDraggableInfo({
            // can access the id of the draggable
            taskId: e.active.id,
            // can access data IN the draggable with e.active.data.current.<key>
            order: e.active.data.current.order,
            colId: e.active.data.current.colId,
        });
    };

    async function handleDragEnd(e) {
        // information about the droppable
        const { over } = e;
        console.log(e);

        // if it's being dropped into a column (no order specified) that is different from the current column
        if (over.id.length === 24 && over.id !== draggableInfo.colId) {
            updateTaskColumn(over);
        };

        // if it's being dropped into a droppable space
        if (over.id.length === 25) {
            const updatedTaskOrder = Number(over.id.slice(-1));
            updateTaskColumn(over, updatedTaskOrder);
        };
    };

    async function updateTaskColumn(droppable, updatedTaskOrder) {
        try {
            const reqOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({  
                    boardId: curBoardId,
                    colId: draggableInfo.colId,
                    taskId: draggableInfo.taskId,
                    taskOrder: draggableInfo.order,
                    updatedColId: (droppable.id.length === 24) ? droppable.id : droppable.id.slice(0, -1),
                    updatedTaskOrder
                }),
                credentials: "include"
            };

            const res = await fetch("http://localhost:3000/update-task", reqOptions);
            if (res.ok) {
                const updatedBoard = await res.json();
                let updatedBoardsData = boardsData.filter(board => {
                    return (board._id !== curBoardId);
                })
                updatedBoardsData.push(updatedBoard);
                setBoardsData(updatedBoardsData);

                setDraggableInfo(null);
            } else {
                throw new Error("Unable to update this task.");
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <main>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {columns}
                {createTaskVis ?
                    <CreateTask curCol={curCol} columnsArr={columnsArr} setBoardsData={setBoardsData} setCreateTaskVis={setCreateTaskVis} /> : <></>
                }
                {createTaskVis ?
                    <div className="backdrop" onClick={() => setCreateTaskVis(false)}/> : null
                }
                <button type="button" className="add-column-btn" onClick={() => setEditBoardVis(true)}>+ New Column</button>
                {editBoardVis ?
                    <EditBoard setBoardsData={setBoardsData} setEditBoardVis={setEditBoardVis} setCurBoardId={setCurBoardId} /> : <></>
                }
                {editBoardVis ?
                    <div className="backdrop" onClick={() => setEditBoardVis(false)}/> : null
                }
            </DndContext>
        </main>
    );
};

export default Board;