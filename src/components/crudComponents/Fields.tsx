// FOR ADJUSTING TEXT BASED ON FORM TYPE: type e.g., "col" or "subtask"
// FOR ADDING/UPDATING VALUES FOR USER TO SEE:
// values e.g., colValues, subtaskValues
// setValues e.g., setColValues, setSubtaskValues
// FOR ADDING NEW FIELDS WITH UNIQUE KEYS/IDS: counterRef
// FOR ADDING VALUES TO A DELETION ARRAY:
// valuesTBD, e.g., colsTBD (to be deleted)
// setValuesTBD e.g., setColsTBD

const Fields = function({ type, values, setValues, counterRef, valuesTBD, setValuesTBD }) {
    let fields = values.map(item => {
        return (
            <label key={item.id} htmlFor={`${type}${item.id}`} className={`${type}-label`}>
                <input type="text" id={`${type}${item.id}`} value={item.value} data-id={item.id} onChange={handleChange} maxLength="50" />
                <button type="button" onClick={() => handleRemoval(item.id)}>
                    <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><g fillRule="evenodd"><path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z"/><path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z"/></g></svg>
                </button>
            </label>
        );
    });

    function handleChange(e) {
        const id = e.target.getAttribute("data-id");
        setValues(values.map(item => {
            if (id == item.id) {
                return { id, value: e.target.value };
            } else {
                return item;
            };
        }));
    };

    function handleRemoval(itemId) {
        // removes item from the values array so that user can no longer see it...
        setValues(values.filter(item => item.id !== itemId));
        // and if it is an edit task/board form that received a deletion array...
        // ...adds the item to the array of values to be deleted (with the ID, but an empty string for the name so that the backend can recognize that it needs to be deleted)
        if (setValuesTBD) setValuesTBD([...valuesTBD, {id: itemId, name: ""}]);
    };

    function handleAddition() {
        setValues([
            ...values,
            { id: counterRef.current, value: "" }
        ]);
        counterRef.current = counterRef.current + 1;
    };

    return (
        <fieldset>
            <legend>{type === "col" ? "Columns" : "Subtasks"}</legend>
            {fields}
            <button type="button" className="add-btn" onClick={handleAddition}>{type === "col" ? "+ Add New Column" : "+ Add New Subtask"}</button>
        </fieldset>
    );
};

export default Fields;