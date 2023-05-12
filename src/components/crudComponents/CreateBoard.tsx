import React, { useState, useContext, useRef } from "react";
import { BoardsContext } from "../../Context";
import { handleDisplayMsg } from "../helpers";
import Fields from "./Fields";

interface Prop {
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    setCreateBoardVis: React.Dispatch<React.SetStateAction<boolean>>
};

const CreateBoard: React.FC<Prop> = function ({ setDisplayMsg, setCreateBoardVis }) {
    const [ boardName, setBoardName ] = useState("");
    const [ errMsg, setErrMsg ] = useState("Field required");
    const [ colValues, setColValues ] = useState([
        { id: "1", value: "" },
        { id: "2", value: "" },
    ]);

    const counterRef = useRef(3);

    const { boardsData, setBoardsData } = useContext(BoardsContext);
    
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target;

        // if there's an input at all 
        if (input.value !== "") { 
            // check that the board name is unique 
            let valid = true;
            boardsData?.forEach(board => {
                if (board.name.trim().toLowerCase() === input.value.trim().toLowerCase()) valid = false;
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

    function handleCreateBoardModal() {
        const createBoardModal: HTMLDialogElement | null = document.querySelector("#create-board-modal");
        createBoardModal?.close();
        
        setCreateBoardVis(false);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!errMsg) {
            let columns: {name: string}[] = [];
            colValues.forEach(col => {
                if (col.value) columns.push({ name: col.value });
            });

            const reqOptions: RequestInit = {
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
                    if (boardsData) setBoardsData([...boardsData, newMongoBoard]);

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
            <dialog className="form-modal" id="create-board-modal">
                <form method="POST" onSubmit={handleSubmit} noValidate>
                    <h2>Add New Board</h2>
                    <label htmlFor="boardName">Board Name *</label>
                    <input type="text" id="boardName" onChange={handleChange} maxLength={20} required />
                    {errMsg ? <p className="err-msg">{errMsg}</p> : null}
                    <Fields type="col" values={colValues} setValues={setColValues} counterRef={counterRef} />
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