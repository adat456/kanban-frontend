import { isAlphanumeric, isEmail } from "validator";

export function handleDisplayMsg({ok, message, msgSetter}) {
    msgSetter(message);

    const displayMsgModal = document.querySelector(".display-msg-modal");
    if (!ok) displayMsgModal?.classList.add("error");
    displayMsgModal?.show();

    setTimeout(() => {
        displayMsgModal?.close();
        displayMsgModal?.classList.remove("error");
        msgSetter("");
    }, 3000);
};

// SIGN UP FORM VALIDATIONS
// for strings that are just required
export function validateReqString(input, msgSetter) {
    if (input.validity.valueMissing) {
        msgSetter("Field required.");
        input.setCustomValidity("Field required.");
    } else {
        msgSetter("");
        input.setCustomValidity("");
    };
};

export function validateEmail(input, msgSetter) {
    if (input.validity.valueMissing) {
        msgSetter("Field required.");
        input.setCustomValidity("Field required.");
        return;
    } else if (!isEmail(input.value)) {
        msgSetter("Please enter a valid email address.");
        input.setCustomValidity("Please enter a valid email address.");
        return;
    } else {
        msgSetter("");
        input.setCustomValidity("");
    };
};

// for username and password
export function validateCred(input, msgSetter) {
    if (input.validity.valueMissing) {
        msgSetter("Field required.");
        input.setCustomValidity("Field required.");
        return;
    } else if (!isAlphanumeric(input.value)) {
        msgSetter("May only contain letters and/or numbers.");
        input.setCustomValidity("May may only contain letters and/or numbers.");
        return;
    } else if (input.validity.tooShort) {
        msgSetter("Must be between 7 and 15 characters long.");
        input.setCustomValidity("Username must be between 7 and 15 characters long.");
        return;
    } else {
        msgSetter("");
        input.setCustomValidity("");
    };
};

export function handleVisToggle(e) {
    const fieldId = e.currentTarget.getAttribute("data-id");
    const field = document.querySelector(`#${fieldId}`);
    if (field?.getAttribute("type") === "password") {
        field?.setAttribute("type", "text");
    } else {
        field?.setAttribute("type", "password");
    };
}; 

// extract info about missing fields (thrown by MongoDB model validation) for error display message
export function extractErrMsg(errMsg) {
    const errMessages = errMsg.slice(24);
    let errMsgArr = errMessages.split(",");
    let displayMsg = "";
    errMsgArr = errMsgArr.map(errMsg => {
        const errArr = errMsg.split(":");
        displayMsg += errArr[1];
    });
    return displayMsg;
};




