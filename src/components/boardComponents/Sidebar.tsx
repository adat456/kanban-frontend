import { useContext } from "react";
import { BoardsContext } from "../../Context";

import CreateBoard from "./CreateBoard";

const Sidebar = function({ setBoardsData }) {
    const boardsData = useContext(BoardsContext);

    const boardLinks = boardsData.map(board => <a key={board._id}>{board.name}</a>);

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