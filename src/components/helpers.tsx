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

