import React, { useContext, useState, useEffect } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

import { BoardsContext, CurBoardIdContext, boardData } from "../../Context";
import Column from "./Column";
import EditBoard from "../crudComponents/EditBoard";

interface Prop {
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    curUserStatus: string
};

interface draggableInfoProp {
    order: string,
    taskId: string,
    colId: string
};

const Board: React.FC<Prop> = function({ setDisplayMsg, curUserStatus }) {
    const boardsDataPair = useContext(BoardsContext);
    const { boardsData, setBoardsData } = boardsDataPair;
    const curBoardIdPair = useContext(CurBoardIdContext);
    const { curBoardId, setCurBoardId } = curBoardIdPair;
    const curBoard = boardsData?.find(board => board._id === curBoardId);
    const columnsArr = curBoard?.columns;

    const [ editBoardVis, setEditBoardVis ] = useState(false);
    const [ draggableInfo, setDraggableInfo ] = useState<draggableInfoProp | null>({ 
        order: "", 
        taskId: "", 
        colId: ""
    });

    // rendering columns w/ their tasks
    const columns = columnsArr?.map(col => 
        <Column key={col._id} col={col} columnsArr={columnsArr} setDisplayMsg={setDisplayMsg} curUserStatus={curUserStatus} />
    );

    // although pointer sensor is one of the default sensors, I imported it with useSensor and useSensors to be passed along to DndContext so that an activation constraint could be added, and a simple click on a draggable opens the task preview instead of initiating a dragstart event
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            delay: 250, 
            tolerance: 10 
        },
    });
    const sensors = useSensors(pointerSensor);

    function handleDragStart(e: any) {
        setDraggableInfo({
            // can access the id of the draggable
            taskId: e.active.id,
            // can access data IN the draggable with e.active.data.current.<key>
            order: e.active.data.current.order,
            colId: e.active.data.current.colId,
        });
    };

    async function handleDragEnd(e: any) {
        // information about the droppable
        const { over } = e;
    
        // if it's being dropped into a column (no order specified) that is different from the current column
        if (over.id.length === 24 && over.id !== draggableInfo?.colId) {
            updateTaskColumn(over);
        };

        // if it's being dropped into a droppable space
        if (over.id.length === 25) {
            const updatedTaskOrder = Number(over.id.slice(-1));
            updateTaskColumn(over, updatedTaskOrder);
        };
    };

    async function updateTaskColumn(droppable: any, updatedTaskOrder?: number) {
        try {
            const reqOptions: RequestInit = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({  
                    boardId: curBoardId,
                    colId: draggableInfo?.colId,
                    taskId: draggableInfo?.taskId,
                    taskOrder: draggableInfo?.order,
                    updatedColId: (droppable.id.length === 24) ? droppable.id : droppable.id.slice(0, -1),
                    updatedTaskOrder
                }),
                credentials: "include"
            };

            const res = await fetch("http://localhost:3000/update-task", reqOptions);
            if (res.ok) {
                const updatedBoard = await res.json();
                let updatedBoardsData = boardsData?.filter(board => {
                    return (board._id !== curBoardId);
                })
                updatedBoardsData?.push(updatedBoard);
                if (updatedBoardsData) setBoardsData(updatedBoardsData);

                setDraggableInfo(null);
            } else {
                throw new Error("Unable to update this task.");
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    useEffect(() => {
        if (editBoardVis) {
            const editBoardModal: HTMLDialogElement | null = document.querySelector("#edit-board-modal");
            editBoardModal?.showModal();
        };
    }, [ editBoardVis ]);

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {columns}
                {(curUserStatus === "Creator" || curUserStatus === "Co-creator") ? 
                    <>
                        <button type="button" className="add-column-btn" onClick={() => setEditBoardVis(true)}>+ New Column</button>
                        {editBoardVis ? <EditBoard setDisplayMsg={setDisplayMsg} setEditBoardVis={setEditBoardVis} /> : null }
                    </> : null
                }    
            </DndContext>
        </>
    );
};

export default Board;