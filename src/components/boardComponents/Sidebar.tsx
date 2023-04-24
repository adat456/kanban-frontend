import { useContext, useState } from "react";
import { BoardsContext } from "../../Context";

import CreateBoard from "./CreateBoard";

const Sidebar = function({ setBoardsData, setCurBoardId }) {
    const [ createBoardVis, setCreateBoardVis ] = useState(false);

    const boardsData = useContext(BoardsContext);

    function handleClick(e) {
        const boardLink = e.target;
        const boardId = boardLink.getAttribute("data-id");
        setCurBoardId(boardId);
    };

    const boardLinks = boardsData.map(board => <a key={board._id} data-id={board._id} onClick={handleClick}>{board.name}</a>);

    return (
        <section className="sidebar">
            <div className="boards">
                <h2>{`ALL BOARDS (${boardsData.length})`}</h2>
                <nav>{boardLinks}</nav>
                <button type="button" onClick={() => setCreateBoardVis(true)}>Create new board</button>
            </div>
            {createBoardVis ? 
                <CreateBoard setBoardsData={setBoardsData} setCreateBoardVis={setCreateBoardVis} /> : 
                <></>
            }
        </section>
    );  
};

export default Sidebar;