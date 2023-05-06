import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleDisplayMsg, validateReqString, validateEmail, validateCred, handleVisToggle, extractErrMsg } from "./helpers";

const Signup = function() {
    const [ firstName, setFirstName ] = useState("");
    const [ firstNameErr, setFirstNameErr ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [ lastNameErr, setLastNameErr ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ emailErr, setEmailErr ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ usernameErr, setUsernameErr ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ passwordErr, setPasswordErr ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");
    const [ confirmPasswordErr, setConfirmPasswordErr ] = useState("");
    const [ displayMsg, setDisplayMsg ] = useState("");

    const navigate = useNavigate();

    function handleChange(e) {
        const input = e.target;
        const field = e.target.getAttribute("id");
        switch (field) {
            case "firstName":
                validateReqString(input, setFirstNameErr);
                setFirstName(input.value);
                break;
            case "lastName":
                validateReqString(input, setLastNameErr);
                setLastName(input.value);
                break;
            case "email":
                validateEmail(input, setEmailErr);
                setEmail(input.value);
                break;
            case "username":
                validateCred(input, setUsernameErr);
                setUsername(input.value);
                break;
            case "password":
                validateCred(input, setPasswordErr);
                const confirmPasswordField = document.querySelector("#confirmPassword");
                if (input.value !== confirmPassword) {
                    setConfirmPasswordErr("Passwords must match.");
                    confirmPasswordField.setCustomValidity("Passwords must match.");
                } else {
                    setConfirmPasswordErr("");
                    confirmPasswordField.setCustomValidity("");
                };
                setPassword(input.value);
                break;
            case "confirmPassword":
                if (input.value !== password) {
                    setConfirmPasswordErr("Passwords must match.");
                    input.setCustomValidity("Passwords must match.");
                } else {
                    setConfirmPasswordErr("");
                    input.setCustomValidity("");
                };
                setConfirmPassword(input.value);
                break;
        };
    };

    async function handleSubmit(e) {
        e.preventDefault();

        const reqOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ firstName, lastName, email, username, password })
        };

        try {
            const res = await fetch("http://localhost:3000/users/sign-up", reqOptions);
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

            // setCustomValidity on fields errored because they are not unique
            if (err.message === "Email and username have already been taken.") {
                const emailField = document.querySelector("#email");
                const usernameField = document.querySelector("#username");
                emailField.setCustomValidity("Already taken.");
                usernameField.setCustomValidity("Already taken.");
            };
            if (err.message === "Email has already been taken.") {
                const emailField = document.querySelector("#email");
                emailField.setCustomValidity("Already taken.");
            };
            if (err.message === "Username has already been taken.") {
                const usernameField = document.querySelector("#username");
                usernameField.setCustomValidity("Already taken.");
            };

            // set display message for missing fields
            if (err.message.startsWith("user validation failed:")) {
                handleDisplayMsg({
                    ok: false,
                    message: extractErrMsg(err.message),
                    msgSetter: setDisplayMsg
                });
            };
        };
    };

    return (
        <>
            <form method="POST" className="signup-form" onSubmit={handleSubmit} autoComplete="off" noValidate>
                <h2>Sign up</h2>
                <label htmlFor="firstName">First name<input type="text" name="firstName" id="firstName" value={firstName} onChange={handleChange} required /></label>
                <p className="err-msg">{firstNameErr}</p>
                <label htmlFor="lastName">Last name<input type="text" name="lastName" id="lastName" value={lastName} onChange={handleChange} required /></label>
                <p className="err-msg">{lastNameErr}</p>
                <hr />
                <label htmlFor="email">Email address<input type="email" name="email" id="email" value={email} onChange={handleChange} required /></label>
                <p className="err-msg">{emailErr}</p>
                <label htmlFor="username">Username<input type="text" name="username" id="username" value={username} onChange={handleChange} minLength="7" maxLength="15" required /></label>
                <p className="err-msg">{usernameErr}</p>
                <label htmlFor="password">Password</label>
                <div className="password-field-set">
                    <input type="password" name="password" id="password" value={password} onChange={handleChange} minLength="7" maxLength="15" required />
                    <button type="button" data-id="password" onClick={handleVisToggle}>
                        <svg viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg"><path d="M15.815 4.434A9.055 9.055 0 0 0 8 0 9.055 9.055 0 0 0 .185 4.434a1.333 1.333 0 0 0 0 1.354A9.055 9.055 0 0 0 8 10.222c3.33 0 6.25-1.777 7.815-4.434a1.333 1.333 0 0 0 0-1.354ZM8 8.89A3.776 3.776 0 0 1 4.222 5.11 3.776 3.776 0 0 1 8 1.333a3.776 3.776 0 0 1 3.778 3.778A3.776 3.776 0 0 1 8 8.89Zm2.889-3.778a2.889 2.889 0 1 1-5.438-1.36 1.19 1.19 0 1 0 1.19-1.189H6.64a2.889 2.889 0 0 1 4.25 2.549Z" /></svg>
                    </button>
                </div>
                <p className="err-msg">{passwordErr}</p>
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="password-field-set">
                    <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={handleChange} />
                    <button type="button" data-id="confirm-password" onClick={handleVisToggle}>
                        <svg viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg"><path d="M15.815 4.434A9.055 9.055 0 0 0 8 0 9.055 9.055 0 0 0 .185 4.434a1.333 1.333 0 0 0 0 1.354A9.055 9.055 0 0 0 8 10.222c3.33 0 6.25-1.777 7.815-4.434a1.333 1.333 0 0 0 0-1.354ZM8 8.89A3.776 3.776 0 0 1 4.222 5.11 3.776 3.776 0 0 1 8 1.333a3.776 3.776 0 0 1 3.778 3.778A3.776 3.776 0 0 1 8 8.89Zm2.889-3.778a2.889 2.889 0 1 1-5.438-1.36 1.19 1.19 0 1 0 1.19-1.189H6.64a2.889 2.889 0 0 1 4.25 2.549Z" /></svg>
                    </button>
                </div>
                <p className="err-msg">{confirmPasswordErr}</p>
                <button type="submit" className="save-btn">Sign up</button>
            </form>
            <dialog className="display-msg-modal">
                <p>{displayMsg}</p>
            </dialog>
        </>
    );
};

export default Signup;