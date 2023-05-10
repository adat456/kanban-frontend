import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { BoardsContext, CurBoardIdContext, boardData } from "../Context";
import { handleDisplayMsg } from "./helpers";
import Sidebar from "./boardComponents/Sidebar";
import EditBoard from "./crudComponents/EditBoard";
import Board from "./boardComponents/Board";

const AllBoards: React.FC<{ setMode: React.Dispatch<React.SetStateAction<string>> }> = function({ setMode }) {
    const [ sidebarVis, setSidebarVis ] = useState(true);
    const [ displayMsg, setDisplayMsg ] = useState("");

    const [ boardsData, setBoardsData ] = useState<null | boardData[]>(null);
    const [ curBoardId, setCurBoardId ] = useState(null);
    const [ curBoardName, setCurBoardName ] = useState("");
    const [ loading, setLoading ] = useState(true);

    const location = useLocation();

    useEffect(() => {
        async function pullBoardsData() {
            try {
                const res = await fetch("http://localhost:3000/read-all", { credentials: "include" });
                const boardsData = await res.json();
                if (res.ok) {
                    setBoardsData(boardsData);
                    setLoading(false);
                    handleDisplayMsg({
                        ok: true,
                        message: "Boards data retrieved.",
                        msgSetter: setDisplayMsg
                    });
                } else {
                    throw new Error("Unable to retrieve boards data.");
                };
            } catch (err) {
                handleDisplayMsg({
                    ok: false,
                    message: err.message,
                    msgSetter: setDisplayMsg
                });
            };
        };          

        // retrieves useLocation state (passed in by Signup and Login components); sets boardsData to an empty array (not null) because Sidebar will need to map over it once loading is set to false
        if (location.state.newUser) {
            setBoardsData([]);
            setLoading(false);
        };

        // if not a new user and boardsData is null, call the async fetch data fx
        if (!location.state.newUser && !boardsData) {
            pullBoardsData();
        };  
    }, []);

    useEffect(() => {
        if (boardsData) {
            boardsData.forEach(board => {
                if (board._id === curBoardId) setCurBoardName(board.name);
            });
        };
    }, [curBoardId]);

    const curBoard = boardsData?.find(board => board._id === curBoardId);
    // ensures that the colValues in both instances of EditBoard will always be UTD (this pair of values is directly passed down to both instances)
    const [ colValues, setColValues ] = useState<{id: string, value: string}[] | null | undefined>(null);
    function handleEditBoardModal() {
        const editBoardModal: HTMLDialogElement | null = document.querySelector("#edit-board-modal");
        editBoardModal?.showModal();
        // calling the setter whenever editBoard is opened 
        setColValues(curBoard?.columns.map(col => { return {id: col._id, value: col.name}}));
    };

    return (  
        <div id="app">
            {/* can pass setters in as values, in addition to the actual value (use an object, and destructure as an object in the consumer) */}
            <BoardsContext.Provider value={{ boardsData, setBoardsData }}>
                <CurBoardIdContext.Provider value={{ curBoardId, setCurBoardId }}>
                    {sidebarVis ?
                        <Sidebar loading={loading} setMode={setMode} setSidebarVis={setSidebarVis} setDisplayMsg={setDisplayMsg} /> :
                        <button onClick={() => setSidebarVis(true)} className="sidebar-vis-btn">
                            <svg viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg"><path d="M15.815 4.434A9.055 9.055 0 0 0 8 0 9.055 9.055 0 0 0 .185 4.434a1.333 1.333 0 0 0 0 1.354A9.055 9.055 0 0 0 8 10.222c3.33 0 6.25-1.777 7.815-4.434a1.333 1.333 0 0 0 0-1.354ZM8 8.89A3.776 3.776 0 0 1 4.222 5.11 3.776 3.776 0 0 1 8 1.333a3.776 3.776 0 0 1 3.778 3.778A3.776 3.776 0 0 1 8 8.89Zm2.889-3.778a2.889 2.889 0 1 1-5.438-1.36 1.19 1.19 0 1 0 1.19-1.189H6.64a2.889 2.889 0 0 1 4.25 2.549Z" fill="#FFF"/></svg>
                        </button>
                    }
                    {!curBoardId ?
                        <div className="all-boards">
                            <header>
                                {sidebarVis ?
                                    null :
                                    <svg className="header-logo mobile" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg"><g fill="#635FC7" fillRule="evenodd"><rect width="6" height="25" rx="2"/><rect opacity=".75" x="9" width="6" height="25" rx="2"/><rect opacity=".5" x="18" width="6" height="25" rx="2"/></g></svg>
                                }
                                <h1>Choose a board to get started.</h1>
                                {/* {sidebarVis ?
                                    <button className="dropdown-sidebar-btn open" type="button" onClick={() => setSidebarVis(false)}>
                                        <svg className="nav-arrow" viewBox="0 0 10 7" xmlns="http://www.w3.org/2000/svg"><path stroke="#635FC7" strokeWidth="2" fill="none" d="M9 6 5 2 1 6"/></svg>
                                    </button> :
                                    <button className="dropdown-sidebar-btn closed" type="button" onClick={() => setSidebarVis(true)}>
                                        <svg className="nav-arrow" viewBox="0 0 10 7" xmlns="http://www.w3.org/2000/svg"><path stroke="#635FC7" strokeWidth="2" fill="none" d="m1 1 4 4 4-4"/></svg>    
                                    </button>
                                } */}
                            </header>
                            <main id="no-brd-chosen" className={sidebarVis ? undefined : "sidebar-hidden"}>
                                <p>Please choose or create a board to get started.</p>
                            </main>
                        </div>  : 
                        <div className="all-boards">
                            <header>
                                {sidebarVis ?
                                    null :
                                    <svg className="header-logo mobile" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg"><g fill="#635FC7" fillRule="evenodd"><rect width="6" height="25" rx="2"/><rect opacity=".75" x="9" width="6" height="25" rx="2"/><rect opacity=".5" x="18" width="6" height="25" rx="2"/></g></svg>
                                }
                                <h1>{curBoardName}</h1>
                                {/* {sidebarVis ?
                                    <button className="dropdown-sidebar-btn open" type="button" onClick={() => setSidebarVis(false)}>
                                        <svg className="nav-arrow" viewBox="0 0 10 7" xmlns="http://www.w3.org/2000/svg"><path stroke="#635FC7" strokeWidth="2" fill="none" d="M9 6 5 2 1 6"/></svg>
                                    </button> :
                                    <button className="dropdown-sidebar-btn closed" type="button" onClick={() => setSidebarVis(true)}>
                                        <svg className="nav-arrow" viewBox="0 0 10 7" xmlns="http://www.w3.org/2000/svg"><path stroke="#635FC7" strokeWidth="2" fill="none" d="m1 1 4 4 4-4"/></svg>    
                                    </button>
                                } */}
                                <button type="button" className="edit-brd-btn" onClick={handleEditBoardModal}><svg viewBox="0 0 5 20" width="5" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="#828FA3" fillRule="evenodd"><circle cx="2.308" cy="2.308" r="2.308"/><circle cx="2.308" cy="10" r="2.308"/><circle cx="2.308" cy="17.692" r="2.308"/></g></svg></button>
                                <EditBoard setDisplayMsg={setDisplayMsg} colValues={colValues} setColValues={setColValues} />
                            </header>
                            <main className={sidebarVis ? undefined : "sidebar-hidden"}>
                                <Board setDisplayMsg={setDisplayMsg} colValues={colValues} setColValues={setColValues} />
                            </main>
                        </div>
                    }
                    <dialog className="display-msg-modal">
                        <p>{displayMsg}</p>
                    </dialog>
                </CurBoardIdContext.Provider>
            </BoardsContext.Provider>
        </div>   
    );
};

export default AllBoards;