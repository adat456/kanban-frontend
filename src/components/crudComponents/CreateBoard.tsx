import { useState, useContext, useEffect } from "react";
import { BoardsContext } from "../../Context";

const CreateBoard = function({ setBoardsData }) {
    // only the board name will be a controlled input
    const [ boardName, setBoardName ] = useState("");
    const [ errMsg, setErrMsg ] = useState("Field required");
    const [ numCols, setNumCols ] = useState(2);
    const [ colFields, setColFields ] = useState([
        <label key={0} htmlFor="col0" className="col-label"><input type="text" id="col0 "name="columns" className="columns create-brd-cols" maxLength="20" /><svg viewBox="0 0 15 15" onClick={handleRemoveColField} xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>,
        <label key={1} htmlFor="col1" className="col-label"><input type="text" id="col1 "name="columns" className="columns create-brd-cols" maxLength="20" /><svg viewBox="0 0 15 15" onClick={handleRemoveColField} xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
    ]);

    const boardsData = useContext(BoardsContext);

    function handleAddColField() {
        // this first setState call will not click in until the next click, which is why the initial value is 2 instead of 1 (0-indexed)
        setNumCols(numCols + 1);
        setColFields(colFields => [...colFields,
            <label key={numCols} htmlFor={`col${numCols}`} className="col-label"><input type="text" id={`col${numCols}`} name="columns" className="columns create-brd-cols" maxLength="20" /><svg viewBox="0 0 15 15" onClick={handleRemoveColField} xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg></label>
        ]);
    };
    
    function handleChange(e) {
        const input = e.target;

        if (input) {
            let valid = true;
            boardsData.forEach(board => {
                if (board.name.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
            });        
            if (!valid) {
                setErrMsg("Board name must be unique.");
                input.setCustomValidity("Board name must be unique.");
            } else {
                setErrMsg(null);
                input.setCustomValidity("");
            };
        };

        setBoardName(input.value);
    };

    useEffect(() => {
        if (boardName === "") setErrMsg("Field required.");
    }, [boardName]);

    function handleRemoveColField(e) {;
        // const parentColField = e.target.closest(".col-label");
        // const colName = parentColField.getAttribute("for");
        // const colIndex = Number(colName.slice(-1));
        // console.log(colIndex);
        
        // const firstHalfColFields = colFields.slice(0, colIndex);
        // const secondHalfColFields = colFields.slice(colIndex + 1);
        // setColFields([...firstHalfColFields, ...secondHalfColFields]);
        // // const parentColField = cross.closest(".col-label");
        // // const allColFields = document.querySelectorAll(".col-label");
        // // const allColFieldsArr = [...allColFields];
        // // const updatedColFields = allColFieldsArr.filter(colField => {
        // //     return (!parentColField.isEqualNode(colField));
        // // });
        // // setColFields(updatedColFields);
        // // const updatedColFields = colFields.filter(colField => {
        // //     return (JSON.stringify(colField) !== JSON.stringify(parentLabel));
        // // });
        // // console.log(updatedColFields);
    };

    function handleCreateBoardModal() {
        const createBoardModal = document.querySelector("#create-board-modal");
        createBoardModal.close();
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!errMsg) {
            let columns = [];      
            function pullColumnNames() {
                const colArr = [...document.getElementsByClassName("create-brd-cols")];
                colArr.forEach(col => {
                    if (col.value) columns.push({ name: col.value });
                });
            };
            pullColumnNames();

            const reqOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ name: boardName, columns }),
                // indicates whether user should receive AND send cookies
                credentials: "include"
            };
            
            try {
                const res = await fetch("http://localhost:3000/create-board", reqOptions);
                const message = await res.json();
                // this will print any messages (success or error) received from the server
                console.log(message);
                if (res.ok) {
                    // update context as well, with board NAME
                    const boardNameUrl = boardName.split(" ").join("-");
                    const res = await fetch(`http://localhost:3000/read-board/${boardNameUrl}`, {credentials: "include"});
                    const newMongoBoard = await res.json();
                    setBoardsData([...boardsData, newMongoBoard]);

                    handleCreateBoardModal();
                } else {
                    // client-generated error message
                    throw new Error("Failed to create board. Please try again later.");
                };
            } catch(err) {
                console.log(err.message);
            };
        } else {
            console.log(errMsg);
            console.log("Please fix errors first.");
        };
    };
    
    return (
        <dialog className="form-modal" id="create-board-modal">
            <form method="POST" onSubmit={handleSubmit} noValidate>
                <h2>Add New Board</h2>
                <label htmlFor="boardName">Board Name *</label>
                <input type="text" id="boardName" value={boardName} onChange={handleChange} maxLength="20" required />
                {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                <fieldset>
                    <legend>Columns</legend>
                    {colFields}
                    <button type="button" className="add-btn" onClick={handleAddColField}>+ Add New Column</button>
                </fieldset>
                <button type="submit" className="save-btn">Create New Board</button>
            </form>
            <button className="close-modal" type="button" onClick={handleCreateBoardModal}>
                <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
            </button>
        </dialog>      
    );
};

export default CreateBoard;