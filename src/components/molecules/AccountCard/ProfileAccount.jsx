import React, { Fragment } from "react";
import { ButtonLinkTo, ButtonDelete } from "../../atoms/ButtonAndLink";
import { Link } from "react-router-dom";

const ProfileAccount = (props) => {
    const {handleActiveAccount, handleDeleteAccount} = props.handleProfileFunc
    const {account, category, parent, masterAccum} = props.dataProfile

    const handleActive = (event) => {
        handleActiveAccount(event)
    }
    const setOneWordProper = (word) => {
        if(word) {
            const initialWord = word.charAt(0).toUpperCase()
            let newWord = initialWord + word.substr(1)
            return newWord
        }
    }
    const getShowActive = (value) => {
        const result = value ? 'Active' : value === false && 'Not Active'
        return result
    }
    return (
        <Fragment>
            <div className="form-check form-switch form-check-reverse">
                {
                    account ?
                    <input className="form-check-input" type="checkbox" id="activeAccount" name="activeAccount" checked={account && account.isActive} onChange={(e)=>handleActive(e)}/>
                    :
                    <input className="form-check-input" type="checkbox" id="activeAccount" name="activeAccount"/>
                }
                <label className="form-check-label" htmlFor="activeAccount">Active</label>
            </div>
            <div className="mb-4">
                <table>
                    <tbody>
                        <tr>
                            <td className="label-detail"><p>Name&nbsp;</p></td>
                            <td><p>:&nbsp;&nbsp;&nbsp;</p></td>
                            <td><p>{account ? account.accountName : '...'}</p></td>
                        </tr>
                        <tr>
                            <td><p>Number&nbsp;</p></td>
                            <td><p>:</p></td>
                            <td><p>{account ? account.number : '...'}</p></td>
                        </tr>
                        <tr>
                            <td><p>Category&nbsp;</p></td>
                            <td><p>:</p></td>
                            <td><p>{category || '...'}</p></td>
                        </tr>
                        <tr>
                            <td><p>Balance&nbsp;</p></td>
                            <td><p>:</p></td>
                            <td><p>{account ? setOneWordProper(account.balance) : '...'}</p></td>
                        </tr>
                        <tr>
                            <td><p>Status&nbsp;</p></td>
                            <td><p>:</p></td>
                            <td><p>{account ? getShowActive(account.isActive) : '...'}</p></td>
                        </tr>
                        <tr><td colSpan={3}>&nbsp;</td></tr>
                        <tr>
                            <td colSpan={3}><h6>Account Mapping</h6></td>
                        </tr>
                        <tr><td><hr className="mt-0"/></td></tr>
                        {
                            account ?
                            (
                                account.isParent ?
                                <tr>
                                    <td colSpan={3}>
                                        {account.isParent ? 'This account is parent account' : 'Loading...'}
                                    </td>
                                </tr>
                                :
                                <tr>
                                    <td><p>Sub Account From&nbsp;</p></td>
                                    <td><p>:</p></td>
                                    <td>
                                        {
                                            parent &&
                                            <p>
                                                <Link to={`/accounts/account-detail/${parent.id}?page=profile`} className="account-name">
                                                    {parent.number}&nbsp; {parent.accountName}
                                                </Link>
                                            </p>
                                        }
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan={3}>Loading...</td>
                                </tr>
                            )
                        }
                        {
                            account && account.isDepreciation &&
                            <tr>
                                <td><p>Depreciation From&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td>
                                    {
                                        masterAccum &&
                                        <p>
                                            <Link to={`/accounts/account-detail/${masterAccum.id}?page=profile`} className="account-name">
                                                {masterAccum.number}&nbsp; {masterAccum.accountName}
                                            </Link>
                                        </p>
                                    }
                                </td>
                            </tr>
                        }
                        {
                            account && account.isAmortization &&
                            <tr>
                                <td><p>Amortization From&nbsp;</p></td>
                                <td><p>:</p></td>
                                <td>
                                    <p>
                                        {masterAccum && masterAccum.number}&nbsp; {masterAccum && masterAccum.accountName}
                                    </p>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            <div>
                {
                    account ?
                    <Fragment>
                        <ButtonLinkTo color="outline-primary" name="Edit" linkTo={`/accounts/edit-account/${account && account.id}`} />
                        &nbsp;&nbsp;&nbsp;
                        <ButtonDelete color="outline-danger" handleOnClick={()=>handleDeleteAccount()}/>
                    </Fragment>
                    :
                    <Fragment>
                        <ButtonLinkTo color="outline-secondary" name="Edit" linkTo="#"/>
                        &nbsp;&nbsp;&nbsp;
                        <ButtonDelete color="outline-secondary" />
                    </Fragment>
                }
            </div>
        </Fragment>
    )
}

export default ProfileAccount