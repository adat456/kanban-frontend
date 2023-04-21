import Sidebar from "./boardComponents/Sidebar";

const AllBoards = function({ setLiteMode, setSidebarVis, setBoardsData }) {
    return (
        <>
            <h1>Made it to all boards!</h1>
            <Sidebar setBoardsData={setBoardsData} />
        </>
    );
};

export default AllBoards;