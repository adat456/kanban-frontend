import { useState, useContext } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";

const EditBoard = function({ setBoardsData, setCurBoardId, setEditBoardVis }) {
    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);

    const curBoard = boardsData.find(board => (board._id === curBoardId));

    const [ boardName, setBoardName ] = useState(curBoard.name);
    const [ numCols, setNumCols ] = useState(curBoard.columns.length);
    const [ extraColFields, setExtraColFields ] = useState([]);
    const [ deleteMsgVis, setDeleteMsgVis ] = useState(false);

    const existingColFields = curBoard.columns.map((col, index) => {
        return (
            <label key={index} htmlFor={`col${index}`}><input type="text" name="columns" className="columns edit-brd-cols" id={`col${index}`} data-id={col._id} defaultValue={col.name} /></label>
        );
    });

    function handleAddColField() {
        setNumCols(numCols + 1);
        setExtraColFields(extraColFields => [...extraColFields,
            <label key={numCols} htmlFor={`col${numCols}`}><input type="text" id={`col${numCols}`} name="columns" className="columns edit-brd-cols" /></label>
        ]);
    };

    function handleChange(e) {
        const input = e.target;
        setBoardName(input.value);
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

                setEditBoardVis(false);
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
            } else {
                throw new Error("Unable to delete board.");
            }
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <form method="POST" onSubmit={handleSubmit}>
            <h2>Edit Board</h2>
            <label htmlFor="boardName">Board Name<input type="text" id="boardName" value={boardName} onChange={handleChange} /></label>
            <fieldset>
                <legend>Columns</legend>
                {existingColFields}
                {extraColFields}
                <button type="button" onClick={handleAddColField}>+ Add New Column</button>
            </fieldset>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setDeleteMsgVis(true)}>Delete Board</button>
            {deleteMsgVis ?
                <section className="delete-brd-msg">
                    <h2>Delete this board?</h2>
                    <p>{`Are you sure you want to delete the '${curBoard.name}' board? This action will remove all columns and tasks and cannot be reversed.`}</p>
                    <button type="button" onClick={handleDelete}>Delete</button>
                    <button type="button" onClick={() => setEditBoardVis(false)}>Cancel</button>
                </section> : <></>
            }
        </form>
    );
};

export default EditBoard;