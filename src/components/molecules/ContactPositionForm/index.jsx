import React from "react";

const ContactPositionForm = (props) => {
    const {vendor, customer, employee, other} = props.data
    return (
        <div>
            <h5 className="mb-3">Position</h5>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="vendor" name="vendor" checked={vendor} onChange={(e)=>props.handleOnClick(e)}/>
                <label className="form-check-label" htmlFor="vendor">Vendor</label>
            </div>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="customer" name="customer" checked={customer} onChange={(e)=>props.handleOnClick(e)}/>
                <label className="form-check-label" htmlFor="customer">Customer</label>
            </div>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="employee" name="employee" checked={employee} onChange={(e)=>props.handleOnClick(e)}/>
                <label className="form-check-label" htmlFor="employee">Employee</label>
            </div>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="other" name="other" checked={other} onChange={(e)=>props.handleOnClick(e)}/>
                <label className="form-check-label" htmlFor="other">Other</label>
            </div>
        </div>
    )
}

export default ContactPositionForm