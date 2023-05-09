import { useState, useContext, useEffect, useRef } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";
import Fields from "./Fields";

const EditBoard = function({ setDisplayMsg, colValues, setColValues }) {
    const { boardsData, setBoardsData } = useContext(BoardsContext);
    const { curBoardId, setCurBoardId } = useContext(CurBoardIdContext);

    const curBoard = boardsData.find(board => (board._id === curBoardId));

    const [ boardName, setBoardName ] = useState(curBoard.name);
    const [ errMsg, setErrMsg ] = useState("");
    // for new columns
    const counterRef = useRef(curBoard.columns.length);
    // need to use a combination of changing keys (formKey, which is attached to dialog element, changes every time curBoardId changes or the dialog element is closed) and defaultValue equal to an empty string or a bit of context (not state) on certain inputs to wipe out stale state
    const [ formKey, setFormKey ] = useState(0);

    function handleChange(e) {
        const input = e.target;

        // if there's an input at all 
        if (input.value !== "") { 
            // check that the board name is unique 
            let valid = true;
            boardsData.forEach(board => {
                if (board._id !== curBoardId && board.name.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
            }); 

            if (valid) {
                setErrMsg(null);
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

    useEffect(() => {
        setFormKey(formKey + 1);
    }, [curBoardId]);

    function handleEditBoardModal() {
        const editBoardModal = document.querySelector("#edit-board-modal");
        editBoardModal.close();
        setFormKey(formKey + 1);
    };

    function handleDeleteBoardModal(action) {
        const deleteBoardModal = document.querySelector("#delete-board-modal");
        if (action === "show") deleteBoardModal.showModal();
        if (action === "close") deleteBoardModal.close();
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!errMsg) { 
            let columns = [];
            colValues.forEach(col => {
                if (col.value) columns.push({ name: col.value, id: col.id });
            });     

            const reqOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ 
                    name: boardName, 
                    boardId: curBoardId,
                    columns
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
                    const filteredBoardsData = boardsData.filter(board => {
                        return (board._id !== curBoardId);
                    });
                    setBoardsData([...filteredBoardsData, updatedMongoBoard]);

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
                const filteredBoardsData = boardsData.filter(board => {
                    return (board._id !== curBoardId);
                });
                setBoardsData(filteredBoardsData);         
                setCurBoardId(null);

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
            <dialog key={formKey} className="form-modal" id="edit-board-modal"> 
                <form method="POST" className="edit-brd-form" onSubmit={handleSubmit} noValidate>
                    <h2>Edit Board</h2>
                    <label htmlFor="boardName">Board Name</label>
                    <input type="text" id="boardName" defaultValue={curBoard.name} onChange={handleChange} maxLength="20" required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    {colValues ? <Fields type="col" values={colValues} valuesSetter={setColValues} counterRef={counterRef} /> : null }
                    <button className="save-btn" type="submit">Save Changes</button>
                    <button className="delete-btn" type="button" onClick={() => {handleEditBoardModal(); handleDeleteBoardModal("show");}}>Delete Board</button>
                    <button className="close-modal" type="button" onClick={handleEditBoardModal}>
                        <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                    </button>
                </form>       
            </dialog>
            <dialog className="delete-modal" id="delete-board-modal">
                <h2>Delete this board?</h2>
                <p>{`Are you sure you want to delete the '${curBoard.name}' board? This action will remove all columns and tasks and cannot be reversed.`}</p>
                <div className="delete-btn-cluster">
                    <button type="button" className="delete-btn" onClick={handleDelete}>Delete</button>
                    <button type="button" className="cancel-btn" onClick={() => handleDeleteBoardModal("close")}>Cancel</button>
                </div>
            </dialog>
        </div>
    );
};

export default EditBoard;