import { useContext } from "react";

import { BoardsContext, CurBoardIdContext } from "../Context";

import Sidebar from "./boardComponents/Sidebar";
import Board from "./boardComponents/Board";

const AllBoards = function({ setLiteMode, setSidebarVis, setBoardsData, setCurBoardId }) {
    const boardsData = useContext(BoardsContext);
    const curBoardId = useContext(CurBoardIdContext);

    let curBoardName;
    boardsData.forEach(board => {
        if (board._id === curBoardId) curBoardName = board.name;
    });

    return (
        <>
            {!curBoardId ? 
                <header>
                    <h1>Choose a board to get started!</h1>
                </header> :
                <header>
                    <h1>{curBoardName}</h1>
                    <button type="button">Modify Board</button>
                </header>
            } 
            <hr />
            <Board setBoardsData={setBoardsData} />
            <hr />
            <Sidebar setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} />
        </>
    );
};

export default AllBoards;