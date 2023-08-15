import React from "react";

const ButtonCreate = (props) => {
    return (
        <button type="submit" className="btn btn-sm btn-outline-success" onClick={props.handleOnClick} disabled={props.disabled}>
            Create <i className="bi bi-check2-circle"></i>
        </button>
    )
}

export default ButtonCreate