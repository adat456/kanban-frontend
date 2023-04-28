import { useContext, useState } from "react";

import { BoardsContext, CurBoardIdContext } from "../Context";

import Sidebar from "./boardComponents/Sidebar";
import EditBoard from "./crudComponents/EditBoard";
import Board from "./boardComponents/Board";

const AllBoards = function({ setMode, setSidebarVis, setBoardsData, setCurBoardId }) {
    const [ editBoardVis, setEditBoardVis ] = useState(false);
    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);

    let curBoardName;
    boardsData.forEach(board => {
        if (board._id === curBoardId) curBoardName = board.name;
    });

    return (
        <>
            <Sidebar setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} setMode={setMode} />
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
                        <button type="button" onClick={() => setEditBoardVis(true)}><svg viewBox="0 0 5 20" width="5" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="#828FA3" fillRule="evenodd"><circle cx="2.308" cy="2.308" r="2.308"/><circle cx="2.308" cy="10" r="2.308"/><circle cx="2.308" cy="17.692" r="2.308"/></g></svg></button>
                        {editBoardVis ?
                            <>
                                <EditBoard setBoardsData={setBoardsData} setEditBoardVis={setEditBoardVis} setCurBoardId={setCurBoardId} />
                                <div className="backdrop" onClick={() => setEditBoardVis(false)} />
                            </> : null
                        }
                    </header>
                    <Board setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} />
                </div>
            }
        </>
    );
};

export default AllBoards;