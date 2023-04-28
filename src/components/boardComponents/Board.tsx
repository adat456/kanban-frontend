import { useContext, useState } from "react";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

import { BoardsContext, CurBoardIdContext } from "../../Context";

import Column from "./Column";
import Task from "./Task";
import CreateTask from "../crudComponents/CreateTask";
import EditBoard from "../crudComponents/EditBoard";

const Board = function({ setBoardsData, setCurBoardId }) {
    const [ createTaskVis, setCreateTaskVis ] = useState(false);
    const [ curCol, setCurCol ] = useState();
    const [ editBoardVis, setEditBoardVis ] = useState(false);
    const [ activeDragInfo, setActiveDragInfo ] = useState({ name: "", taskId: "", colId: "" });

    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);
    const curBoard = boardsData.find(board => board._id === curBoardId);
    const columnsArr = curBoard.columns;

    // rendering columns w/ their tasks
    const columns = curBoard.columns.map(col => 
        <Column key={col._id} col={col} setCreateTaskVis={setCreateTaskVis} setCurCol={setCurCol} setBoardsData={setBoardsData} />
    );

    // 1. upon dragging a draggable, drag info is set in activeDragInfo state, which includes the task ID and the column ID (for updating the database), and the task name (for display)
    // 2. when state is changed, the condition in DragOverLay evaluates to true and the drag overlay is displayed (just the task name is needed)
    // 3. when the draggable is dropped into a droppable, the info in activeDragInfo state is sent in a fetch request
    // 4. if the fetch/POST request is successful, then activeDragInfo state is set to null
    // 5. this causes the DragOverlay condition to evaluate to false, and the drag overlay is unmounted/no longer displayed

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            delay: 1000, 
            tolerance: 10 
        },
    });
    const sensors = useSensors(pointerSensor);

    function handleDragStart(e) {
        setActiveDragInfo({
            // can access the id of the draggable 
            taskId: e.active.id,
            // can access data IN the draggable with e.active.data.current.<key>
            name: e.active.data.current.name,
            colId: e.active.data.current.colId,
        });
    };

    async function handleDragEnd(e) {
        try {
            // e.over.id is the unique id of the DROPPABLE in this handler
            if (e.over && (e.over.id !== activeDragInfo.colId)) { 
                console.log("New column");

                const reqOptions = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({  
                        boardId: curBoardId,
                        colId: activeDragInfo.colId,
                        taskId: activeDragInfo.taskId,
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

                    setActiveDragInfo(null);
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
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {columns}
                {createTaskVis ?
                    <CreateTask curCol={curCol} columnsArr={columnsArr} setBoardsData={setBoardsData} setCreateTaskVis={setCreateTaskVis} /> : <></>
                }
                {createTaskVis ?
                    <div className="backdrop" onClick={() => setCreateTaskVis(false)}/> : null
                }
                <button type="button" className="add-column-btn" onClick={() => setEditBoardVis(true)}>+ Add New Column</button>
                {editBoardVis ?
                    <EditBoard setBoardsData={setBoardsData} setEditBoardVis={setEditBoardVis} setCurBoardId={setCurBoardId} /> : <></>
                }
                {editBoardVis ?
                    <div className="backdrop" onClick={() => setEditBoardVis(false)}/> : null
                }
                {/* dropAnimation={null} prevents dragOverlay from sliiiiding back to where it came from before the context/data is updated --> makes it look cleaner */}
                <DragOverlay dropAnimation={null} >
                    {activeDragInfo ?
                        <Task name={activeDragInfo.name} /> : null
                    }
                </DragOverlay>
            </DndContext>
        </main>
    );
};

export default Board;