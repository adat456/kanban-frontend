import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BoardsContext } from "./Context";

import Login from "./components/Login";
import Signup from "./components/Signup";
import AllBoards from "./components/AllBoards";

function App() {
  const [ liteMode, setLiteMode ] = useState(true);
  const [ sidebarVis, setSidebarVis ] = useState(true);
  const [ boardsData, setBoardsData ] = useState({});

  return (
    <div className="App">
      <BoardsContext.Provider value={boardsData}>
        <BrowserRouter>
          <Routes>
            <Route path="/log-in" element={<Login setBoardsData={setBoardsData} />} />
            <Route path="/sign-up" element={<Signup />} />
            <Route path="/boards/*" element={<AllBoards />} />
          </Routes>
        </BrowserRouter>
      </BoardsContext.Provider>
    </div>
  )
}

export default App
