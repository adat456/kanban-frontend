import React, { useContext, useState, useRef, useEffect } from "react";
import { BoardsContext, CurBoardIdContext, ModeContext, UserContext, userInterface, boardData } from "../../Context";
import { useNavigate } from "react-router-dom";
import { handleDisplayMsg } from "../helpers";
import CreateBoard from "../crudComponents/CreateBoard";

interface Prop {
    loading: boolean,
    setMode: React.Dispatch<React.SetStateAction<string>>,
    setSidebarVis: React.Dispatch<React.SetStateAction<boolean>>,
    setDisplayMsg: React.Dispatch<React.SetStateAction<string>>,
    setUser: React.Dispatch<React.SetStateAction<userInterface>>,
};

const Sidebar: React.FC<Prop> = function({ loading, setMode, setSidebarVis, setDisplayMsg, setUser }) {
    const boardsDataPair = useContext(BoardsContext);
    const { boardsData, setBoardsData } = boardsDataPair;
    const curBoardIdPair = useContext(CurBoardIdContext);
    const { curBoardId, setCurBoardId } = curBoardIdPair;
    const mode = useContext(ModeContext);
    const user = useContext(UserContext);

    const [ createBoardVis, setCreateBoardVis ] = useState(false);

    const circleRef = useRef<null | HTMLDivElement>(null);

    function handleSetCurBoard(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        const boardLink = e.target as HTMLAnchorElement;
        const boardId = boardLink.getAttribute("data-id");
        setCurBoardId(boardId);
    };

    useEffect(() => {
        if (createBoardVis) {
            const createBoardModal: HTMLDialogElement | null = document.querySelector("#create-board-modal");
            createBoardModal?.showModal();
        };
    }, [createBoardVis]);

    let boardLinks;
    if (!loading) {
        boardLinks = boardsData?.map(board => {
            const id = (board._id === curBoardId) ? "current" : "";
    
            return (
                <div key={board._id} className="board-container" id={id}>
                    <div className="board-links-item">
                        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z" /></svg>
                        <a data-id={board._id} onClick={handleSetCurBoard}>{board.name}</a>
                        <button type="button" id={`star-btn-${board._id}`} className={user?.favorites.includes(board._id) ? "star-btn favorite" : "star-btn" } onClick={() => handleToggleFavorite(board._id)}><svg className="star" version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" enableBackground="new 0 0 64 64" xmlSpace="preserve"><g><path d="M49.302,63.999c-0.664,0-1.332-0.164-1.938-0.5l-15.365-8.498l-15.366,8.498c-1.344,0.742-2.993,0.652-4.243-0.23c-1.25-0.883-1.891-2.403-1.645-3.915l2.981-18.261L1.138,28.185c-1.047-1.074-1.406-2.641-0.93-4.063c0.477-1.422,1.707-2.457,3.188-2.684l17.237-2.633L28.376,2.31c0.661-1.407,2.071-2.301,3.622-2.301s2.961,0.895,3.622,2.301l7.743,16.495l17.237,2.633c1.48,0.227,2.711,1.262,3.188,2.684c0.477,1.423,0.117,2.989-0.93,4.063L50.271,41.093l2.98,18.261c0.246,1.512-0.395,3.032-1.645,3.915C50.919,63.753,50.11,63.999,49.302,63.999z M31.998,46.43c0.668,0,1.332,0.168,1.938,0.5l10.092,5.579l-1.98-12.119c-0.203-1.254,0.199-2.527,1.086-3.438l8.563-8.779l-11.654-1.781c-1.316-0.199-2.449-1.043-3.016-2.255l-5.028-10.712L26.97,24.137c-0.566,1.212-1.699,2.056-3.016,2.255L12.3,28.173l8.563,8.779c0.887,0.91,1.289,2.184,1.086,3.438l-1.98,12.119l10.092-5.579C30.666,46.598,31.33,46.43,31.998,46.43z"/><path d="M31.998,46.43c0.668,0,1.332,0.168,1.938,0.5l10.092,5.579l-1.98-12.119c-0.203-1.254,0.199-2.527,1.086-3.438l8.563-8.779l-11.654-1.781c-1.316-0.199-2.449-1.043-3.016-2.255l-5.028-10.712L26.97,24.137c-0.566,1.212-1.699,2.056-3.016,2.255L12.3,28.173l8.563,8.779c0.887,0.91,1.289,2.184,1.086,3.438l-1.98,12.119l10.092-5.579C30.666,46.598,31.33,46.43,31.998,46.43z"/></g></svg></button> 
                    </div>
                </div>
            );
        });
    };

    async function handleToggleFavorite(boardId: string) {
        try {
            const reqOptions: RequestInit = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ boardId }),
                credentials: "include"
            };

            const res = await fetch("http://localhost:3000/update-board-favorite", reqOptions);
            const updatedUser = await res.json();
            if (res.ok) {
                setUser(updatedUser);

                const button: HTMLButtonElement | null = document.getElementById(`star-btn-${boardId}`);
                if (button) button.classList.toggle("favorite");
            };
        } catch (err) {
            handleDisplayMsg({
                ok: false,
                message: err.message,
                msgSetter: setDisplayMsg,
            });
        };
    };

    function handleModeToggle() {
        if (mode === "light") {
            setMode("dark");
            circleRef?.current?.classList.add("dark");
            circleRef?.current?.classList.remove("light");
        };
        if (mode === "dark") {
            setMode("light");
            circleRef?.current?.classList.add("light");
            circleRef?.current?.classList.remove("dark");
        };
    };

    const navigate = useNavigate();
    async function handleLogOut() {
        try {
            const res = await fetch("http://localhost:3000/users/log-out", {credentials: "include"});
            if (res.ok) {
                navigate("/log-in");
            } else {
                throw new Error("Unable to log out.");
            };
        } catch(err) {
            console.log(err);
        };
    };

    return (
        <section className="sidebar">
            {(mode === "light") ?
                <svg className="logo" viewBox="0 0 153 26" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M44.56 25v-5.344l1.92-2.112L50.928 25h5.44l-6.304-10.432 6.336-7.04h-5.92l-5.92 6.304V.776h-4.8V25h4.8Zm19.36.384c2.176 0 3.925-.672 5.248-2.016V25h4.48V13.48c0-1.259-.315-2.363-.944-3.312-.63-.95-1.51-1.69-2.64-2.224-1.13-.533-2.432-.8-3.904-.8-1.856 0-3.483.427-4.88 1.28-1.397.853-2.352 2.005-2.864 3.456l3.84 1.824a4.043 4.043 0 0 1 1.424-1.856c.65-.47 1.403-.704 2.256-.704.896 0 1.605.224 2.128.672.523.448.784 1.003.784 1.664v.48l-4.832.768c-2.09.341-3.648.992-4.672 1.952-1.024.96-1.536 2.176-1.536 3.648 0 1.579.55 2.816 1.648 3.712 1.099.896 2.587 1.344 4.464 1.344Zm.96-3.52c-.597 0-1.099-.15-1.504-.448-.405-.299-.608-.715-.608-1.248 0-.576.181-1.019.544-1.328.363-.31.885-.528 1.568-.656l3.968-.704v.544c0 1.067-.363 1.973-1.088 2.72-.725.747-1.685 1.12-2.88 1.12ZM81.968 25V14.792c0-1.003.299-1.808.896-2.416.597-.608 1.365-.912 2.304-.912.939 0 1.707.304 2.304.912.597.608.896 1.413.896 2.416V25h4.8V13.768c0-1.323-.277-2.48-.832-3.472a5.918 5.918 0 0 0-2.32-2.32c-.992-.555-2.15-.832-3.472-.832-1.11 0-2.09.208-2.944.624a4.27 4.27 0 0 0-1.952 1.904V7.528h-4.48V25h4.8Zm24.16.384c1.707 0 3.232-.405 4.576-1.216a8.828 8.828 0 0 0 3.184-3.296c.779-1.387 1.168-2.923 1.168-4.608 0-1.707-.395-3.248-1.184-4.624a8.988 8.988 0 0 0-3.2-3.28c-1.344-.81-2.848-1.216-4.512-1.216-2.112 0-3.787.619-5.024 1.856V.776h-4.8V25h4.48v-1.664c.619.661 1.392 1.168 2.32 1.52a8.366 8.366 0 0 0 2.992.528Zm-.576-4.32c-1.301 0-2.363-.443-3.184-1.328-.821-.885-1.232-2.043-1.232-3.472 0-1.408.41-2.56 1.232-3.456.821-.896 1.883-1.344 3.184-1.344 1.323 0 2.41.453 3.264 1.36.853.907 1.28 2.053 1.28 3.44 0 1.408-.427 2.56-1.28 3.456-.853.896-1.941 1.344-3.264 1.344Zm17.728 4.32c2.176 0 3.925-.672 5.248-2.016V25h4.48V13.48c0-1.259-.315-2.363-.944-3.312-.63-.95-1.51-1.69-2.64-2.224-1.13-.533-2.432-.8-3.904-.8-1.856 0-3.483.427-4.88 1.28-1.397.853-2.352 2.005-2.864 3.456l3.84 1.824a4.043 4.043 0 0 1 1.424-1.856c.65-.47 1.403-.704 2.256-.704.896 0 1.605.224 2.128.672.523.448.784 1.003.784 1.664v.48l-4.832.768c-2.09.341-3.648.992-4.672 1.952-1.024.96-1.536 2.176-1.536 3.648 0 1.579.55 2.816 1.648 3.712 1.099.896 2.587 1.344 4.464 1.344Zm.96-3.52c-.597 0-1.099-.15-1.504-.448-.405-.299-.608-.715-.608-1.248 0-.576.181-1.019.544-1.328.363-.31.885-.528 1.568-.656l3.968-.704v.544c0 1.067-.363 1.973-1.088 2.72-.725.747-1.685 1.12-2.88 1.12ZM141.328 25V14.792c0-1.003.299-1.808.896-2.416.597-.608 1.365-.912 2.304-.912.939 0 1.707.304 2.304.912.597.608.896 1.413.896 2.416V25h4.8V13.768c0-1.323-.277-2.48-.832-3.472a5.918 5.918 0 0 0-2.32-2.32c-.992-.555-2.15-.832-3.472-.832-1.11 0-2.09.208-2.944.624a4.27 4.27 0 0 0-1.952 1.904V7.528h-4.48V25h4.8Z" fill="#000112" fillRule="nonzero"/><g transform="translate(0 1)" fill="#635FC7"><rect width="6" height="25" rx="2"/><rect opacity=".75" x="9" width="6" height="25" rx="2"/><rect opacity=".5" x="18" width="6" height="25" rx="2"/></g></g></svg> :
                <svg className="logo" viewBox="0 0 153 26" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M44.56 25v-5.344l1.92-2.112L50.928 25h5.44l-6.304-10.432 6.336-7.04h-5.92l-5.92 6.304V.776h-4.8V25h4.8Zm19.36.384c2.176 0 3.925-.672 5.248-2.016V25h4.48V13.48c0-1.259-.315-2.363-.944-3.312-.63-.95-1.51-1.69-2.64-2.224-1.13-.533-2.432-.8-3.904-.8-1.856 0-3.483.427-4.88 1.28-1.397.853-2.352 2.005-2.864 3.456l3.84 1.824a4.043 4.043 0 0 1 1.424-1.856c.65-.47 1.403-.704 2.256-.704.896 0 1.605.224 2.128.672.523.448.784 1.003.784 1.664v.48l-4.832.768c-2.09.341-3.648.992-4.672 1.952-1.024.96-1.536 2.176-1.536 3.648 0 1.579.55 2.816 1.648 3.712 1.099.896 2.587 1.344 4.464 1.344Zm.96-3.52c-.597 0-1.099-.15-1.504-.448-.405-.299-.608-.715-.608-1.248 0-.576.181-1.019.544-1.328.363-.31.885-.528 1.568-.656l3.968-.704v.544c0 1.067-.363 1.973-1.088 2.72-.725.747-1.685 1.12-2.88 1.12ZM81.968 25V14.792c0-1.003.299-1.808.896-2.416.597-.608 1.365-.912 2.304-.912.939 0 1.707.304 2.304.912.597.608.896 1.413.896 2.416V25h4.8V13.768c0-1.323-.277-2.48-.832-3.472a5.918 5.918 0 0 0-2.32-2.32c-.992-.555-2.15-.832-3.472-.832-1.11 0-2.09.208-2.944.624a4.27 4.27 0 0 0-1.952 1.904V7.528h-4.48V25h4.8Zm24.16.384c1.707 0 3.232-.405 4.576-1.216a8.828 8.828 0 0 0 3.184-3.296c.779-1.387 1.168-2.923 1.168-4.608 0-1.707-.395-3.248-1.184-4.624a8.988 8.988 0 0 0-3.2-3.28c-1.344-.81-2.848-1.216-4.512-1.216-2.112 0-3.787.619-5.024 1.856V.776h-4.8V25h4.48v-1.664c.619.661 1.392 1.168 2.32 1.52a8.366 8.366 0 0 0 2.992.528Zm-.576-4.32c-1.301 0-2.363-.443-3.184-1.328-.821-.885-1.232-2.043-1.232-3.472 0-1.408.41-2.56 1.232-3.456.821-.896 1.883-1.344 3.184-1.344 1.323 0 2.41.453 3.264 1.36.853.907 1.28 2.053 1.28 3.44 0 1.408-.427 2.56-1.28 3.456-.853.896-1.941 1.344-3.264 1.344Zm17.728 4.32c2.176 0 3.925-.672 5.248-2.016V25h4.48V13.48c0-1.259-.315-2.363-.944-3.312-.63-.95-1.51-1.69-2.64-2.224-1.13-.533-2.432-.8-3.904-.8-1.856 0-3.483.427-4.88 1.28-1.397.853-2.352 2.005-2.864 3.456l3.84 1.824a4.043 4.043 0 0 1 1.424-1.856c.65-.47 1.403-.704 2.256-.704.896 0 1.605.224 2.128.672.523.448.784 1.003.784 1.664v.48l-4.832.768c-2.09.341-3.648.992-4.672 1.952-1.024.96-1.536 2.176-1.536 3.648 0 1.579.55 2.816 1.648 3.712 1.099.896 2.587 1.344 4.464 1.344Zm.96-3.52c-.597 0-1.099-.15-1.504-.448-.405-.299-.608-.715-.608-1.248 0-.576.181-1.019.544-1.328.363-.31.885-.528 1.568-.656l3.968-.704v.544c0 1.067-.363 1.973-1.088 2.72-.725.747-1.685 1.12-2.88 1.12ZM141.328 25V14.792c0-1.003.299-1.808.896-2.416.597-.608 1.365-.912 2.304-.912.939 0 1.707.304 2.304.912.597.608.896 1.413.896 2.416V25h4.8V13.768c0-1.323-.277-2.48-.832-3.472a5.918 5.918 0 0 0-2.32-2.32c-.992-.555-2.15-.832-3.472-.832-1.11 0-2.09.208-2.944.624a4.27 4.27 0 0 0-1.952 1.904V7.528h-4.48V25h4.8Z" fill="#FFF" fillRule="nonzero"/><g transform="translate(0 1)" fill="#635FC7"><rect width="6" height="25" rx="2"/><rect opacity=".75" x="9" width="6" height="25" rx="2"/><rect opacity=".5" x="18" width="6" height="25" rx="2"/></g></g></svg>
            }
            {loading ? <p>Loading...</p>:
                <div className="board-links">
                    <h2>{`ALL BOARDS (${boardsData?.length})`}</h2>
                    <nav>{boardLinks}</nav>
                    <div className="create-brd-container">
                        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z" /></svg>
                        <button type="button" className="create-brd-btn" onClick={() => setCreateBoardVis(true)}>+ Create new board</button>
                    </div>
                </div>
            }
            {createBoardVis ? <CreateBoard setDisplayMsg={setDisplayMsg} setCreateBoardVis={setCreateBoardVis} /> : null }
            <div className="sidebar-btm-cluster">
                <div className="mode-toggle">
                    <svg viewBox="0 0 19 19" xmlns="http://www.w3.org/2000/svg"><path d="M9.167 15.833a.833.833 0 0 1 .833.834v.833a.833.833 0 0 1-1.667 0v-.833a.833.833 0 0 1 .834-.834ZM3.75 13.75a.833.833 0 0 1 .59 1.422l-1.25 1.25a.833.833 0 0 1-1.18-1.178l1.25-1.25a.833.833 0 0 1 .59-.244Zm10.833 0c.221 0 .433.088.59.244l1.25 1.25a.833.833 0 0 1-1.179 1.178l-1.25-1.25a.833.833 0 0 1 .59-1.422ZM9.167 5a4.167 4.167 0 1 1 0 8.334 4.167 4.167 0 0 1 0-8.334Zm-7.5 3.333a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.834Zm15.833 0a.833.833 0 0 1 0 1.667h-.833a.833.833 0 0 1 0-1.667h.833Zm-1.667-6.666a.833.833 0 0 1 .59 1.422l-1.25 1.25a.833.833 0 1 1-1.179-1.178l1.25-1.25a.833.833 0 0 1 .59-.244Zm-13.333 0c.221 0 .433.088.59.244l1.25 1.25a.833.833 0 0 1-1.18 1.178L1.91 3.09a.833.833 0 0 1 .59-1.422ZM9.167 0A.833.833 0 0 1 10 .833v.834a.833.833 0 1 1-1.667 0V.833A.833.833 0 0 1 9.167 0Z" fill="#828FA3"/></svg>
                    <div className="toggler" onClick={handleModeToggle}>
                        <div ref={circleRef} id="circle" className="light"></div>
                    </div>
                    <svg className="dark-mode" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M6.474.682c.434-.11.718.406.481.78A6.067 6.067 0 0 0 6.01 4.72c0 3.418 2.827 6.187 6.314 6.187.89.002 1.77-.182 2.584-.54.408-.18.894.165.724.57-1.16 2.775-3.944 4.73-7.194 4.73-4.292 0-7.771-3.41-7.771-7.615 0-3.541 2.466-6.518 5.807-7.37Zm8.433.07c.442-.294.969.232.674.674l-.525.787a1.943 1.943 0 0 0 0 2.157l.525.788c.295.441-.232.968-.674.673l-.787-.525a1.943 1.943 0 0 0-2.157 0l-.786.525c-.442.295-.97-.232-.675-.673l.525-.788a1.943 1.943 0 0 0 0-2.157l-.525-.787c-.295-.442.232-.968.674-.673l.787.525a1.943 1.943 0 0 0 2.157 0Z" fill="#828FA3"/></svg>
                </div>
                <button type="button" className="hide-sidebar" onClick={() => setSidebarVis(false)}>
                    <svg viewBox="0 0 18 16" xmlns="http://www.w3.org/2000/svg"><path d="M8.522 11.223a4.252 4.252 0 0 1-3.654-5.22l3.654 5.22ZM9 12.25A8.685 8.685 0 0 1 1.5 8a8.612 8.612 0 0 1 2.76-2.864l-.86-1.23A10.112 10.112 0 0 0 .208 7.238a1.5 1.5 0 0 0 0 1.524A10.187 10.187 0 0 0 9 13.75c.414 0 .828-.025 1.239-.074l-1-1.43A8.88 8.88 0 0 1 9 12.25Zm8.792-3.488a10.14 10.14 0 0 1-4.486 4.046l1.504 2.148a.375.375 0 0 1-.092.523l-.648.453a.375.375 0 0 1-.523-.092L3.19 1.044A.375.375 0 0 1 3.282.52L3.93.068a.375.375 0 0 1 .523.092l1.735 2.479A10.308 10.308 0 0 1 9 2.25c3.746 0 7.031 2 8.792 4.988a1.5 1.5 0 0 1 0 1.524ZM16.5 8a8.674 8.674 0 0 0-6.755-4.219A1.75 1.75 0 1 0 12.75 5v-.001a4.25 4.25 0 0 1-1.154 5.366l.834 1.192A8.641 8.641 0 0 0 16.5 8Z" fill="#828FA3"/></svg>
                    Hide Sidebar
                </button>
                <hr />
                <button className="log-out-btn" onClick={handleLogOut}>Log Out</button>
            </div>
        </section>
    );  
};

export default Sidebar;