import React, { Fragment } from "react";

const PillBadge = (props) => {
    return (
        <Fragment>
            <span className={`badge rounded-pill text-bg-${props.color} fw-normal`}>{props.name}</span>
            { props.spaceItem && ' ' }
        </Fragment>
    )
}

export default PillBadge