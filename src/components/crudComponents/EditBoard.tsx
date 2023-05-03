import { useState, useContext } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";

const EditBoard = function({ setBoardsData, setCurBoardId }) {
    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);

    const curBoard = boardsData.find(board => (board._id === curBoardId));

    const [ boardName, setBoardName ] = useState(curBoard.name);
    const [ numCols, setNumCols ] = useState(curBoard.columns.length);
    const [ extraColFields, setExtraColFields ] = useState([]);

    const existingColFields = curBoard.columns.map((col, index) => {
        return (
            <label key={index} htmlFor={`col${index}`} className="col-label"><input type="text" name="columns" className="columns edit-brd-cols" id={`col${index}`} data-id={col._id} defaultValue={col.name} /><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
        );
    });

    function handleAddColField() {
        setNumCols(numCols + 1);
        setExtraColFields(extraColFields => [...extraColFields,
            <label key={numCols} htmlFor={`col${numCols}`} className="col-label"><input type="text" id={`col${numCols}`} name="columns" className="columns edit-brd-cols" /><svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
        ]);
    };

    function handleChange(e) {
        const input = e.target;
        setBoardName(input.value);
    };

    function handleEditBoardModal() {
        const editBoardModal = document.querySelector("#edit-board-modal");
        editBoardModal.close();
    };

    function handleDeleteBoardModal(action) {
        const deleteBoardModal = document.querySelector("#delete-board-modal");
        if (action === "show") deleteBoardModal.showModal();
        if (action === "close") deleteBoardModal.close();
    };

    async function handleSubmit(e) {
        e.preventDefault();

        let columns = [];      
        function pullColumns() {
            const colArr = [...document.getElementsByClassName("edit-brd-cols")];
            colArr.forEach((col, index) => {
                // push all columns regardless of whether field is an emptry string; if it has an id, mongodb will delete that column, if it does not, mongodb will not add another column
                columns.push({
                    name: col.value,
                    order: index,
                    id: col.getAttribute("data-id"),
                });
            });
        };
        pullColumns();

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
            console.log(updatedMongoBoard);
            if (res.ok) {
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
            console.log(err.message);
        };
    };

    async function handleDelete() {
        try {
            const res = await fetch(`http://localhost:3000/delete-board/${curBoardId}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                const msg = await res.json();
                console.log(msg);

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
            console.log(err.message);
        };
    };

    return (
        <>
            <dialog className="form-modal" id="edit-board-modal">
                <form method="POST" className="edit-brd-form" onSubmit={handleSubmit}>
                    <h2>Edit Board</h2>
                    <label htmlFor="boardName">Board Name<input type="text" id="boardName" value={boardName} onChange={handleChange} /></label>
                    <fieldset>
                        <legend>Columns</legend>
                        {existingColFields}
                        {extraColFields}
                        <button type="button" className="add-btn" onClick={handleAddColField}>+ Add New Column</button>
                    </fieldset>
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
        </>
    );
};

export default EditBoard;