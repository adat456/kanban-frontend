import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModeContext } from "./Context";

import Login from "./components/Login";
import Signup from "./components/Signup";
import AllBoards from "./components/AllBoards";

function App() {
  const [ mode, setMode ] = useState("light");

  useEffect(() => {
    const app = document.querySelector("#app");
    if (mode === "light") app?.classList.remove("dark");
    if (mode === "dark") app?.classList.add("dark");
  }, [mode]);

  return (
    <div className="App">
          <ModeContext.Provider value={mode}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/log-in" element={<Login />} />
                <Route path="/sign-up" element={<Signup />} />
                <Route path="/boards" element={<AllBoards setMode={setMode} />} />
              </Routes>
            </BrowserRouter>
          </ModeContext.Provider>
    </div>
  )
}

export default App
