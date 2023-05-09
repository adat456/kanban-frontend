import { useState, useContext, useRef } from "react";
import { BoardsContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";
import Fields from "./Fields";

const CreateBoard = function({ setDisplayMsg, colValues, setColValues }) {
    const [ boardName, setBoardName ] = useState("");
    const [ errMsg, setErrMsg ] = useState("Field required");
    const counterRef = useRef(3);
    // need to use changing keys (formKey, which is attached to dialog element, changes every time the dialog element is closed)
    // optionally, can specify a defaultValue (not from state) on UNCONTROLLED inputs (such as board name) to replace any stale state, or state lingering from the last time the form was opened. otherwise, defaultValue will be set to "" by defaults
    const [ formKey, setFormKey ] = useState(0);

    const { boardsData, setBoardsData } = useContext(BoardsContext);
    
    function handleChange(e) {
        const input = e.target;

        // if there's an input at all 
        if (input.value !== "") { 
            // check that the board name is unique 
            let valid = true;
            boardsData.forEach(board => {
                if (board.name.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
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

    function handleCreateBoardModal() {
        const createBoardModal = document.querySelector("#create-board-modal");
        createBoardModal.close();
        setFormKey(formKey + 1);
        setErrMsg("Field required.");
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!errMsg) {
            let columns = [];
            colValues.forEach(col => {
                if (col.value) columns.push({ name: col.value });
            });

            const reqOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ name: boardName, columns }),
                // indicates whether user should receive AND send cookies
                credentials: "include"
            };
            
            try {
                const res = await fetch("http://localhost:3000/create-board", reqOptions);
                if (res.ok) {
                    handleDisplayMsg({
                        ok: true,
                        message: "Board created.",
                        msgSetter: setDisplayMsg
                    });
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
                handleDisplayMsg({
                    ok: false,
                    message: err.message,
                    msgSetter: setDisplayMsg
                });
            };
        } else {
            handleDisplayMsg({
                ok: false,
                message: "Please fix errors before submitting.",
                msgSetter: setDisplayMsg
            });
        };
    };
    
    return (
        <>
            <dialog key={formKey} className="form-modal" id="create-board-modal">
                <form method="POST" onSubmit={handleSubmit} noValidate>
                    <h2>Add New Board</h2>
                    <label htmlFor="boardName">Board Name *</label>
                    <input type="text" id="boardName" onChange={handleChange} maxLength="20" required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    <Fields type="col" values={colValues} valuesSetter={setColValues} counterRef={counterRef} />
                    <button type="submit" className="save-btn">Create New Board</button>
                </form>
                <button className="close-modal" type="button" onClick={handleCreateBoardModal}>
                    <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                </button>
            </dialog>  
        </>    
    );
};

export default CreateBoard;