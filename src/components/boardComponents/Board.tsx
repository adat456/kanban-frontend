import React, { useContext, useState, useEffect } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

import { BoardsContext, CurBoardIdContext, UserStatusContext, FilterContext, SortContext } from "../../Context";
import Column from "./Column";
import EditBoard from "../crudComponents/EditBoard";

interface Prop {
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
};

interface draggableInfoProp {
    order: string,
    taskId: string,
    colId: string
};

const Board: React.FC<Prop> = function({ setDisplayMsg }) {
    const boardsDataPair = useContext(BoardsContext);
    const { boardsData, setBoardsData } = boardsDataPair;
    const curBoardIdPair = useContext(CurBoardIdContext);
    const { curBoardId, setCurBoardId } = curBoardIdPair;
    const userStatus = useContext(UserStatusContext);
    const curBoard = boardsData?.find(board => board._id === curBoardId);
    const columnsArr = curBoard?.columns;

    const [ filters, setFilters ] = useState<string[]>([]);
    // const [ sorter, setSorter ] = useState<string>("");
    const [ editBoardVis, setEditBoardVis ] = useState(false);
    const [ draggableInfo, setDraggableInfo ] = useState<draggableInfoProp | null>({ 
        order: "", 
        taskId: "", 
        colId: ""
    });

    function handleFilterClick(e: React.MouseEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;
        const filter = input.getAttribute("id");
        if (input.checked && filter) setFilters([...filters, filter]);
        if (!input.checked && filter) setFilters(filters.filter(existingFilter => existingFilter !== filter));
    };
    // function handleSortClick(e: React.MouseEvent<HTMLInputElement>) {
    //     const input = e.target as HTMLInputElement;
    //     const sort = input.getAttribute("id");
    //     if (sort) setSorter(sort);
    // };
    function handleResetAll(e: React.MouseEvent<HTMLButtonElement>) {
        // setSorter("");
        setFilters([]);
    };

    // rendering columns w/ their tasks
    const columns = columnsArr?.map(col => 
        <Column key={col._id} col={col} filters={filters} columnsArr={columnsArr} setDisplayMsg={setDisplayMsg} />
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
                let updatedBoardsData = boardsData?.map(board => {
                    if (board._id !== curBoardId) return board;
                    if (board._id === curBoardId) return updatedBoard;
                });
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
        {/* // <FilterContext.Provider value={filters}>
        //     <SortContext.Provider value={sorter}> */}
                <form className="sort-and-filter">
                    <fieldset>
                        <legend>Filter by:</legend>
                        <div>
                            <input type="checkbox" id="assigned" name="filter" onClick={handleFilterClick}/>
                            <label htmlFor="assigned">Assigned</label>
                        </div>
                        <div>
                            <input type="checkbox" id="incomplete" name="filter" onClick={handleFilterClick} />
                            <label htmlFor="incomplete">Incomplete</label>
                        </div>
                        <div>
                            <input type="checkbox" id="overdue" name="filter" onClick={handleFilterClick} />
                            <label htmlFor="overdue">Overdue</label>
                        </div>
                    </fieldset>
                    {/* <fieldset>
                        <legend>Sort by:</legend>
                        <div>
                            <input type="radio" id="creation-asc" name="sorter" onClick={handleSortClick} />
                            <label htmlFor="creation-asc">Creation ascending</label>
                        </div>
                        <div>
                            <input type="radio" id="creation-desc" name="sorter" onClick={handleSortClick} />
                            <label htmlFor="creation-desc">Creation descending</label>
                        </div>
                        <div>
                            <input type="radio" id="deadline-asc" name="sorter" onClick={handleSortClick} />
                            <label htmlFor="deadline-asc">Deadline ascending</label>
                        </div>
                        <div>
                            <input type="radio" id="deadline-desc" name="sorter" onClick={handleSortClick} />
                            <label htmlFor="deadline-desc">Deadline descending</label>
                        </div>
                    </fieldset> */}
                    <button type="reset" onClick={handleResetAll}>Reset</button>
                </form>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <section className="board">
                        {columns}
                        {(userStatus === "Creator" || userStatus === "Co-creator") ? 
                            <>
                                <button type="button" className="add-column-btn" onClick={() => setEditBoardVis(true)}>+ New Column</button>
                                {editBoardVis ? <EditBoard setDisplayMsg={setDisplayMsg} setEditBoardVis={setEditBoardVis} /> : null }
                            </> : null
                        }    
                    </section>
                </DndContext>
            {/* </SortContext.Provider>
        </FilterContext.Provider> */}
        </>
    );
};

export default Board;