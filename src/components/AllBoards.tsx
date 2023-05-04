import { useContext, useState } from "react";

import { BoardsContext, CurBoardIdContext } from "../Context";

import Sidebar from "./boardComponents/Sidebar";
import EditBoard from "./crudComponents/EditBoard";
import Board from "./boardComponents/Board";

const AllBoards = function({ setMode, setBoardsData, setCurBoardId }) {
    const [ sidebarVis, setSidebarVis ] = useState(true);
    const [ displayMsg, setDisplayMsg ] = useState("");

    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);
    let curBoardName;
    boardsData.forEach(board => {
        if (board._id === curBoardId) curBoardName = board.name;
    });

    function handleEditBoardModal() {
        const editBoardModal = document.querySelector("#edit-board-modal");
        editBoardModal.showModal();
    };

    return (
        <div id="app">
            {sidebarVis ?
                <Sidebar setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} setMode={setMode} setSidebarVis={setSidebarVis} setDisplayMsg={setDisplayMsg} /> :
                <button onClick={() => setSidebarVis(true)} className="sidebar-vis-btn">
                    <svg viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg"><path d="M15.815 4.434A9.055 9.055 0 0 0 8 0 9.055 9.055 0 0 0 .185 4.434a1.333 1.333 0 0 0 0 1.354A9.055 9.055 0 0 0 8 10.222c3.33 0 6.25-1.777 7.815-4.434a1.333 1.333 0 0 0 0-1.354ZM8 8.89A3.776 3.776 0 0 1 4.222 5.11 3.776 3.776 0 0 1 8 1.333a3.776 3.776 0 0 1 3.778 3.778A3.776 3.776 0 0 1 8 8.89Zm2.889-3.778a2.889 2.889 0 1 1-5.438-1.36 1.19 1.19 0 1 0 1.19-1.189H6.64a2.889 2.889 0 0 1 4.25 2.549Z" fill="#FFF"/></svg>
                </button>
            }
            {!curBoardId ?
                <div className="all-boards">
                    <header>
                        <h1>Choose a board to get started.</h1>
                    </header>
                    <main className="no-brd-chosen">
                        <p>Please choose or create a board to get started.</p>
                    </main>
                </div>  : 
                <div className="all-boards">
                    <header>
                        <h1>{curBoardName}</h1>
                        <button type="button" className="edit-brd-btn" onClick={handleEditBoardModal}><svg viewBox="0 0 5 20" width="5" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="#828FA3" fillRule="evenodd"><circle cx="2.308" cy="2.308" r="2.308"/><circle cx="2.308" cy="10" r="2.308"/><circle cx="2.308" cy="17.692" r="2.308"/></g></svg></button>
                        <EditBoard setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} setDisplayMsg={setDisplayMsg} />
                    </header>
                    <Board setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} setDisplayMsg={setDisplayMsg} />
                </div>
            }
            <dialog className="display-msg-modal">
                <p>{displayMsg}</p>
            </dialog>
        </div>
    );
};

export default AllBoards;