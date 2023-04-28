import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BoardsContext, CurBoardIdContext, ModeContext } from "./Context";

import Login from "./components/Login";
import Signup from "./components/Signup";
import AllBoards from "./components/AllBoards";

function App() {
  const [ mode, setMode ] = useState("light");
  const [ sidebarVis, setSidebarVis ] = useState(true);
  const [ boardsData, setBoardsData ] = useState({});
  const [ curBoardId, setCurBoardId ] = useState("");

  return (
    <div className="App">
      <BoardsContext.Provider value={boardsData}>
        <CurBoardIdContext.Provider value={curBoardId}>
          <ModeContext.Provider value={mode}>
            <BrowserRouter>
              <Routes>
                <Route path="/log-in" element={<Login setBoardsData={setBoardsData} />} />
                <Route path="/sign-up" element={<Signup />} />
                <Route path="/boards" element={<AllBoards setMode={setMode} setSidebarVis={setSidebarVis} setBoardsData={setBoardsData} setCurBoardId={setCurBoardId} />} />
              </Routes>
            </BrowserRouter>
          </ModeContext.Provider>
        </CurBoardIdContext.Provider>
      </BoardsContext.Provider>
    </div>
  )
}

export default App
