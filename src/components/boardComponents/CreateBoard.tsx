import { useState, useContext } from "react";
import { BoardsContext } from "../../Context";

const CreateBoard = function({ setBoardsData, setCreateBoardVis }) {
    // only the board name will be a controlled input
    const [ boardName, setBoardName ] = useState("");
    const [ numCols, setNumCols ] = useState(2);
    const [ extraColFields, setExtraColFields ] = useState([]);

    const boardsData = useContext(BoardsContext);

    function handleAddColField() {
        // this first setState call will not click in until the next click, which is why the initial value is 2 instead of 1 (0-indexed)
        setNumCols(numCols + 1);
        setExtraColFields(extraColFields => [...extraColFields,
            <label key={numCols} htmlFor={`col${numCols}`}><input type="text" id={`col${numCols}`} name="columns" className="columns" /></label>
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
            const colArr = [...document.getElementsByClassName("columns")];
            colArr.forEach((col, index) => {
                if (col.value) {
                    columns.push({
                        name: col.value,
                        order: index,
                    });
                };
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
            } else {
                // client-generated error message
                throw new Error("Failed to create board. Please try again later.");
            };

            // close out window/modal and reset controlled and uncontrolled fields

            // need to remove all col fields entirely, because resetting state does not prevent persistence of previous col fields and their data...
            function removeAllColFields() {
                const colArr = [...document.getElementsByClassName("columns")];
                colArr.forEach(col => col.remove());
            };
            removeAllColFields();
            
            setNumCols(2);
            setExtraColFields([]);
            setBoardName("");

            setCreateBoardVis(false);

        } catch(err) {
            console.log(err.message);
        };

    };
    
    return (
        <form method="POST" className="create-board" onSubmit={handleSubmit}>
            <h2>Add New Board</h2>
            <label htmlFor="boardName">Board Name<input type="text" id="boardName" value={boardName} onChange={handleChange} /></label>
            <fieldset>
                <legend>Columns</legend>
                <label htmlFor="col0"><input type="text" id="col0" name="columns" className="columns" /></label>
                <label htmlFor="col1"><input type="text" id="col1" name="columns" className="columns" /></label>
                {extraColFields}
                <button type="button" onClick={handleAddColField}>+ Add New Column</button>
            </fieldset>
            <button type="submit">Create New Board</button>
        </form>
    );
};

export default CreateBoard;