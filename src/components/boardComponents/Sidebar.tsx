import { useContext } from "react";
import { BoardsContext } from "../../Context";

import CreateBoard from "./CreateBoard";

const Sidebar = function({ setBoardsData, setCurBoardId }) {
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
                <button type="button">Create new board</button>
            </div>
            <CreateBoard setBoardsData={setBoardsData} />
        </section>
    );  
};

export default Sidebar;