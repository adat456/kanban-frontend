// valueArr e.g., colValues, subtaskValues
// type e.g., "col" or "subtask"
const Fields = function({ type, values, valuesSetter, counterRef }) {
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
        valuesSetter(values.map(item => {
            if (id == item.id) {
                return { id, value: e.target.value };
            } else {
                return item;
            };
        }));
    };

    function handleRemoval(itemId) {
        valuesSetter(values.filter(item => item.id !== itemId));
    };

    function handleAddition() {
        valuesSetter([
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