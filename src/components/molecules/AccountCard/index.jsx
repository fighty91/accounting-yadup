import React, { Children } from "react";
import { Link } from 'react-router-dom';
import './AccountCard.scss'

const AccountCard = (props) => {
    const {children, dataCard, navbarActive } = props
    const {profileActive, transActive, subListActive} = navbarActive
    const {accountId, isParent} = dataCard
    return (
        <div className="card">
            <div className="card-header d-inline-flex">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <Link className={`nav-link ${profileActive && 'active'}`} aria-current="true" to={`/accounts/account-detail/${accountId}?page=profile`}>Profile</Link>
                    </li>
                    {
                        isParent ?
                        <li className="nav-item">
                            <Link className={`nav-link ${subListActive && 'active'}`} to={`/accounts/account-detail/${accountId}?page=sub-account-list`}>Sub Account</Link>
                        </li>
                        :
                        <li className="nav-item">
                            <Link className={`nav-link ${transActive && 'active'}`} to={`/accounts/account-detail/${accountId}?page=transactions`}>Transactions</Link>
                        </li>
                    }
                </ul>
            </div>
            <div className="card-body mt-0">
                {
                    Children.map(children, (child, i) =>
                        <div className="Row">
                            { child }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default AccountCard