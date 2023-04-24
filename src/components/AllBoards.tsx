import { useContext, useState } from "react";

import { BoardsContext, CurBoardIdContext } from "../Context";

import Sidebar from "./boardComponents/Sidebar";
import EditBoard from "../components/boardComponents/EditBoard";
import Board from "./boardComponents/Board";

const AllBoards = function({ setLiteMode, setSidebarVis, setBoardsData, setCurBoardId }) {
    const [ editBoardVis, setEditBoardVis ] = useState(false);
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
                    <button type="button" onClick={() => setEditBoardVis(true)}>Modify Board</button>
                    {editBoardVis ?
                        <EditBoard setBoardsData={setBoardsData} setEditBoardVis={setEditBoardVis} /> : <></>
                    }
                </header>
            } 
            <hr />
            {!curBoardId ? <p>No board chosen!</p> : <Board setBoardsData={setBoardsData} />}
            <hr />
            <Sidebar setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} />
        </>
    );
};

export default AllBoards;