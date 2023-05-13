import { useState, useRef } from "react";

interface Prop {
    setContributorModal: React.Dispatch<React.SetStateAction<boolean>>
};

interface ContributorType {
    key: number,
    userId: string,
    userName: string,
    userStatus?: string,
};

const ContributorModal: React.FC<Prop> = function({ setContributorModal }) {
    const [ search, setSearch ] = useState("");
    const [ results, setResults ] = useState("");
    const [ contributors, setContributors ] = useState<ContributorType[]>([
        {
            key: 0,
            userId: "123",
            userName: "Ada Truong",
            userStatus: "Member",
        },
        {
            key: 1,
            userId: "456",
            userName: "Erik Anderson",
            userStatus: "Co-creator",
        },
    ]);

    const counterRef = useRef(0);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value);
    };

    // fetch request that sends the search term and adds any matches to the results state to be rendered

    // function to add the match to the contributors array with a default userStatus of "Member"

    let contributorsArr = contributors?.map(contributor => {
        return (
            <div key={contributor.key} className="contributor">
                <p>{contributor.userName}</p>
                <select name="status" id="status" defaultValue={contributor.userStatus}>
                    <option value="Co-creator">Co-creator</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                </select>
                <button type="button" onClick={() => handleRemoval(contributor.key)}>
                    <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                </button>
            </div>
        );
    });

    function handleRemoval(key: number) {
        setContributors(contributors.filter(contributor => contributor.key !== key));
    };

    function handleContributorModal() {
        const modal: HTMLDialogElement | null = document.querySelector("#contributor-modal");
        modal?.close();
        setContributorModal(false);
    };

    return (
        <dialog className="form-modal" id="contributor-modal">
            <h2>Add Contributors</h2>
            <form>
                <label>Search by username or email:</label>
                <div className="search-bar">
                    <input type="text" name="search" value={search} onChange={handleChange} placeholder='e.g., "lieutenantworf" or "lt.worf@starfleet.gov"' />
                    <button type="submit">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15C11.381 15 12.6296 14.4415 13.5355 13.5355C14.4415 12.6296 15 11.381 15 10C15 7.23858 12.7614 5 10 5ZM3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5719 16.481 13.0239 15.6063 14.1921L20.7071 19.2929C21.0976 19.6834 21.0976 20.3166 20.7071 20.7071C20.3166 21.0976 19.6834 21.0976 19.2929 20.7071L14.1921 15.6063C13.0239 16.481 11.5719 17 10 17C6.13401 17 3 13.866 3 10Z" /></svg>
                    </button>
                </div>
            </form>
            {results ? null : null}
            <hr />
            {contributorsArr}
            <form>

                <button type="submit" className="save-btn">Save Contributors</button>
            </form>
            <button className="close-modal" type="button" onClick={handleContributorModal}>
                <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
            </button>
        </dialog>
    )
};

export default ContributorModal;