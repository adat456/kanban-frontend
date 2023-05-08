import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleDisplayMsg, validateCred, handleVisToggle } from "./helpers";

const Login = function() {
    const [ username, setUsername ] = useState("");
    const [ usernameErr, setUsernameErr ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ passwordErr, setPasswordErr ] = useState("");
    const [ displayMsg, setDisplayMsg ] = useState("");
    const navigate = useNavigate();

    function handleChange(e) {
        const input = e.target;
        const field = e.target.getAttribute("id");
        if (field === "username") {
            validateCred(input, setUsernameErr);
            setUsername(input.value);
        };
        if (field === "password") {
            validateCred(input, setPasswordErr);
            setPassword(input.value);
        };
    };

    async function handleSubmit(e) {
        e.preventDefault();

        const reqOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password }),
            credentials: "include"
        };

        try {
            const res = await fetch("http://localhost:3000/users/log-in", reqOptions);
            // must parse the JSON error, because if the log in attempt failed, the returned JSON message contains the specific error message
            const message = await res.json();
            if (res.ok) {
                navigate("/boards");
            } else {
                throw new Error(message);
            };
        } catch(err) {
            handleDisplayMsg({
                ok: false,
                message: err.message,
                msgSetter: setDisplayMsg
            });
        };
    };

    return (
        <>
            <form method="POST" className="login-form" onSubmit={handleSubmit} noValidate autoComplete="off">
                <h2>Log in</h2>
                <label htmlFor="username">Username<input type="text" name="username" id="username" value={username} onChange={handleChange} required maxLength="15" /></label>
                <p className="err-msg">{usernameErr}</p>
                <label htmlFor="password">Password</label>
                <div className="password-field-set">
                    <input type="password" name="password" id="password" value={password} onChange={handleChange} required maxLength="15" />
                    <button type="button" data-id="password" onClick={handleVisToggle}>
                        <svg viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg"><path d="M15.815 4.434A9.055 9.055 0 0 0 8 0 9.055 9.055 0 0 0 .185 4.434a1.333 1.333 0 0 0 0 1.354A9.055 9.055 0 0 0 8 10.222c3.33 0 6.25-1.777 7.815-4.434a1.333 1.333 0 0 0 0-1.354ZM8 8.89A3.776 3.776 0 0 1 4.222 5.11 3.776 3.776 0 0 1 8 1.333a3.776 3.776 0 0 1 3.778 3.778A3.776 3.776 0 0 1 8 8.89Zm2.889-3.778a2.889 2.889 0 1 1-5.438-1.36 1.19 1.19 0 1 0 1.19-1.189H6.64a2.889 2.889 0 0 1 4.25 2.549Z" /></svg>
                    </button>
                </div>
                <p className="err-msg">{passwordErr}</p>
                <button type="submit" className="save-btn">Log in</button>
            </form>
            <dialog className="display-msg-modal">
                <p>{displayMsg}</p>
            </dialog>
        </>
    );
};

export default Login;