import { useDroppable } from "@dnd-kit/core";

const DroppableSpace = function({ id }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    // style (making the droppable space/line visible) is only applied when the task/droppable is over the element
    const lineStyle = isOver ? 
        {
            backgroundColor: "#E4EBFA",
            width: "100%",
            height: "2px",
            margin: "2rem 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        } : null;

    const numStyle = isOver ?
        {
            backgroundColor: "#E4EBFA",
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        } : 
        {
            display: "none"
        };

    return (
        <div ref={setNodeRef} style={lineStyle} className="droppable-task-space">
            <div style={numStyle}>{id.slice(-1)}</div>
        </div>
    );
};

export default DroppableSpace;