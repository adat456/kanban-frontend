import { useState, useContext } from "react";

import { BoardsContext, CurBoardIdContext } from "../../Context";

const EditBoard = function({ setBoardsData, setEditBoardVis }) {
    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);

    const curBoard = boardsData.find(board => (board._id === curBoardId));

    const [ boardName, setBoardName ] = useState(curBoard.name);
    const [ numCols, setNumCols ] = useState(curBoard.columns.length);
    const [ extraColFields, setExtraColFields ] = useState([]);

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
        function pullColumnNames() {
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
        pullColumnNames();

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
            <button type="button">Delete Board</button>
        </form>
    );
};

export default EditBoard;