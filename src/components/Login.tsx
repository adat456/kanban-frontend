import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = function({ setBoardsData }) {
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const navigate = useNavigate();

    function handleChange(e) {
        const input = e.target;
        const field = e.target.getAttribute("id");
        if (field === "username") setUsername(input.value);
        if (field === "password") setPassword(input.value);
    };

    async function handleSubmit(e) {
        e.preventDefault();

        const reqOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        };

        try {
            const res = await fetch("http://localhost:3000/users/log-in", reqOptions);
            if (res.ok) {
                const message = await res.json();
                setBoardsData(message);
                navigate("/boards");
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <form method="POST" onSubmit={handleSubmit}>
            <h1>Log in</h1>
            <label htmlFor="username"><input type="text" name="username" id="username" value={username} onChange={handleChange} placeholder="Username"/></label>
            <label htmlFor="password"><input type="password" name="password" id="password" value={password} onChange={handleChange} placeholder="password"/></label>
            <button type="submit">Log in</button>
        </form>
    );
};

export default Login;