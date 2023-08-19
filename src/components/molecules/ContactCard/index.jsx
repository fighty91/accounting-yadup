import React, { Children } from "react";
import { Link } from 'react-router-dom';
import PillBadge from "../../atoms/PillBadge";
import { ButtonLinkTo } from "../../atoms/ButtonAndLink";
import './ContactCard.css'

const ContactCard = (props) => {
    const {children, contactId, detailActive, transactionsActive, newPositions, name} = props
    return (
        <div className="card">
            <div className="card-header d-inline-flex">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <Link className={`nav-link ${detailActive}`} aria-current="true" to={`/contacts/detail/${contactId}`}>Profile</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${transactionsActive}`} to={`/contacts/transactions/${contactId}`}>Transactions</Link>
                    </li>
                </ul>
            </div>
            <div className="card-body mt-3">

                <div className="d-md-flex justify-content-between">
                    <div className="d-inline-flex me-2 col-12 col-md-8">
                        <h5 className="card-title">{name}</h5>
                        <div className="ms-2">
                            {
                                newPositions.map((position, i) => {
                                    return (
                                        <PillBadge key={i+1} name={position.name} color={position.color} spaceItem={i < newPositions.length-1 ? true : false }/>
                                        )
                                    })
                                }
                        </div>
                    </div>
                    <div className="col-sm-3 col-md-3 col-lg-2 d-md-flex justify-content-md-end">
                        <ButtonLinkTo name="Back to Contacts" color="outline-secondary" linkTo="/contacts" />
                    </div>
                </div>

                <hr/>

                {
                    Children.map(children, (child, i) =>
                        <div className="Row">
                            {child}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default ContactCard