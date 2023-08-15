import React, { Fragment } from "react";

const ContentHeader = (props) => {
    return(
        <Fragment>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <div>
                <h1 className="h2">{props.name}</h1>
                { props.subName && <p className="mb-0 mt-0 pb-0 pt-0">{props.subName || 'Sub Title'}</p> }

                </div>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <div className="btn-group me-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1">
                        <svg className="bi"><use xlinkHref="#calendar3"/></svg>
                        This week
                    </button>
                </div>
            </div>
        </Fragment>
        
    )
}

export default ContentHeader