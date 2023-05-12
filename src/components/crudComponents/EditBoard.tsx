import React, { useState, useContext, useEffect, useRef } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";
import Fields from "./Fields";

interface Prop {
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    setEditBoardVis: React.Dispatch<React.SetStateAction<boolean>>
};

const EditBoard: React.FC<Prop> = function({ setDisplayMsg, setEditBoardVis }) {
    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);
    const curBoard = boardsData?.find(board => (board._id === curBoardId));

    const [ boardName, setBoardName ] = useState(curBoard?.name);
    const [ errMsg, setErrMsg ] = useState("");
    const [ colValues, setColValues ] = useState(curBoard?.columns.map(col => { return {id: col._id, value: col.name}}));
    const [ colsTBD, setColsTBD ] = useState([]);
    // for new columns
    const counterRef = useRef(curBoard?.columns.length);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target;

        // if there's an input at all 
        if (input.value !== "") { 
            // check that the board name is unique 
            let valid = true;
            boardsData?.forEach(board => {
                if (board._id !== curBoardId && board.name.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
            }); 

            if (valid) {
                setErrMsg("");
                input.setCustomValidity("");
            } else {
                setErrMsg("Board name must be unique.");
                input.setCustomValidity("Board name must be unique.");
            };
        };
        
        // if there's no input, throw err
        if (input.value === "") {
            setErrMsg("Field required.");
            input.setCustomValidity("");
        };

        setBoardName(input.value);
    };

    function handleEditBoardModal() {
        const editBoardModal: HTMLDialogElement | null = document.querySelector("#edit-board-modal");
        editBoardModal?.close();

        setEditBoardVis(false);
    };

    function handleDeleteBoardModal(action: string) {
        const deleteBoardModal: HTMLDialogElement | null = document.querySelector("#delete-board-modal");
        if (action === "show") {
            const editBoardModal: HTMLDialogElement | null = document.querySelector("#edit-board-modal");
            editBoardModal?.close();
            deleteBoardModal?.showModal();
        };
        if (action === "close") {
            deleteBoardModal?.close();
            setEditBoardVis(false);
        };
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!errMsg) { 
            let columns: {name: string, id: string}[] = [];
            colValues?.forEach(col => {
                // filters out any column fields that were left empty and formats info in the object
                if (col.value) columns.push({ name: col.value, id: col.id });
            });     

            const reqOptions: RequestInit = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ 
                    name: boardName, 
                    boardId: curBoardId,
                    // sends both columns that need to be added/updated and columns that need to be deleted
                    columns: [...columns, ...colsTBD]
                }),
                // indicates whether user should receive AND send cookies
                credentials: "include"
            };
            
            try {
                const res = await fetch("http://localhost:3000/update-board", reqOptions);
                const updatedMongoBoard = await res.json();
                if (res.ok) {
                    handleDisplayMsg({ok: true, message: "Board updated.", msgSetter: setDisplayMsg});
    
                    // update context as well
                    const filteredBoardsData = boardsData?.filter(board => {
                        return (board._id !== curBoardId);
                    });
                    if (filteredBoardsData) setBoardsData([...filteredBoardsData, updatedMongoBoard]);

                    handleEditBoardModal();
                } else {
                    // client-generated error message
                    throw new Error("Failed to update board. Please try again later.");
                };
            } catch(err) {
                handleDisplayMsg({ok: false, message: err.message, msgSetter: setDisplayMsg});
            };
        } else {
            handleDisplayMsg({ok: false, message: "Please fix errors before submitting.", msgSetter: setDisplayMsg});
        };
    };

    async function handleDelete() {
        try {
            const res = await fetch(`http://localhost:3000/delete-board/${curBoardId}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                handleDisplayMsg({ok: true, message: "Board deleted.", msgSetter: setDisplayMsg});
    
                // update context as well
                const filteredBoardsData = boardsData?.filter(board => {
                    return (board._id !== curBoardId);
                });
                if (filteredBoardsData) setBoardsData(filteredBoardsData);         
                setCurBoardId("");

                handleDeleteBoardModal("close");
            } else {
                throw new Error("Unable to delete board.");
            }
        } catch(err) {
            handleDisplayMsg({ok: false, message: err.message, msgSetter: setDisplayMsg});
        };
    };

    return (
        <div>
            <dialog className="form-modal" id="edit-board-modal"> 
                <form method="POST" className="edit-brd-form" onSubmit={handleSubmit} noValidate>
                    <h2>Edit Board</h2>
                    <label htmlFor="boardName">Board Name</label>
                    <input type="text" id="boardName" defaultValue={curBoard?.name} onChange={handleChange} maxLength={20} required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    {colValues ? <Fields type="col" values={colValues} setValues={setColValues} counterRef={counterRef} valuesTBD={colsTBD} setValuesTBD={setColsTBD} /> : null }
                    <button className="save-btn" type="submit">Save Changes</button>
                    <button className="delete-btn" type="button" onClick={() => handleDeleteBoardModal("show")}>Delete Board</button>
                    <button className="close-modal" type="button" onClick={handleEditBoardModal}>
                        <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                    </button>
                </form>       
            </dialog>
            <dialog className="delete-modal" id="delete-board-modal">
                <h2>Delete this board?</h2>
                <p>{`Are you sure you want to delete the '${curBoard?.name}' board? This action will remove all columns and tasks and cannot be reversed.`}</p>
                <div className="delete-btn-cluster">
                    <button type="button" className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button type="button" className="cancel-btn" onClick={() => handleDeleteBoardModal("close")}>Cancel</button>
                </div>
            </dialog>
        </div>
    );
};

export default EditBoard;