import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = function() {
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const navigate = useNavigate();

    function handleChange(e) {
        const input = e.target;
        const field = e.target.getAttribute("id");
        switch (field) {
            case "firstName":
                setFirstName(input.value);
                break;
            case "lastName":
                setLastName(input.value);
                break;
            case "email":
                setEmail(input.value);
                break;
            case "username":
                setUsername(input.value);
                break;
            case "password":
                setPassword(input.value);
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
            if (res.ok) {
                const message = await res.json();
                console.log(message);
                navigate("/boards");
            };
        } catch(err) {
            console.log(err.message);
        };
    };

    return (
        <form method="POST" onSubmit={handleSubmit}>
            <h1>Sign up</h1>
            <label htmlFor="firstName">First name<input type="text" name="firstName" id="firstName" value={firstName} onChange={handleChange} /></label>
            <label htmlFor="lastName">Last name<input type="text" name="lastName" id="lastName" value={lastName} onChange={handleChange} /></label>
            <label htmlFor="email">Email address<input type="email" name="email" id="email" value={email} onChange={handleChange} /></label>
            <label htmlFor="username">Username<input type="text" name="username" id="username" value={username} onChange={handleChange} /></label>
            <label htmlFor="password">Password<input type="password" name="password" id="password" value={password} onChange={handleChange} /></label>
            <button type="submit">Sign up</button>
        </form>
    );
};

export default Signup;