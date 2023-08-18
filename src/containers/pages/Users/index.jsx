import React, { Fragment, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ContentHeader from "../../organisms/Layouts/ContentHeader/ContentHeader";
import './Users.scss'
import LayoutsMainContent from "../../organisms/Layouts/LayoutMainContent";
import { connect } from "react-redux";
import { getTransactionsFromAPI, getUserAccessFromAPI, getUsersFromAPI } from "../../../config/redux/action";
import Swal from "sweetalert2";

const Users = (props) => {
    const [userAccess, setUserAccess] = useState([])
    const [users, setUsers] = useState([])
    // const [transactions, setTransactions] = useState([])
    // const Toast = Swal.mixin({
    //     toast: true,
    //     position: 'top-end',
    //     showConfirmButton: false,
    //     timer: 1700,
    //     timerProgressBar: true,
    //     didOpen: (toast) => {
    //       toast.addEventListener('mouseenter', Swal.stopTimer)
    //       toast.addEventListener('mouseleave', Swal.resumeTimer)
    //     }
    // })

    // const getConfirmDelete = (data) => {
    //     const res = transactions.find(e => e.contactId === data.id)
    //     if(res) {
    //         Swal.fire(
    //             'Failed!',
    //             `There is already transactions in ${data.name}`,
    //             'info'
    //         )
    //     } else {
    //         deleteContact(data)
    //     }
    // }

    // const deleteContact = async (data) => {
    //     const res = await props.deleteContactFromAPI(data.id)
    //     if(res) {
    //         Toast.fire({
    //             icon: 'success',
    //             title: `Success Delete \n${data.name}`
    //         })
    //     }
    // }

    // const handleDeleteContact = (data) => {
    //     Swal.fire({
    //         title: 'Are you sure?',
    //         text: `${data.name} will be removed from the list!`,
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Yes, delete it!'
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             getConfirmDelete(data)
    //         }
    //     })
    // }

    useEffect(() => {
        props.getTransactionsFromAPI()
        props.getUsersFromAPI()
        props.getUserAccessFromAPI()
    }, [])
    
    useEffect(() => {
        let temp = []
        for(let i of props.users) {
            i.userAccessId > 0 && temp.push(i)
        }
        setUsers(temp)
    }, [props.users])

    useEffect(() => {
        setUserAccess(props.userAccess)
    }, [props.userAccess])
    
    // useEffect(() => {
    //     let temp = []
    //     for(let x in props.transactions) {
    //         props.transactions[x].forEach(e => temp.push(e))
    //     }
    //     setTransactions(temp)
    // }, [props.transactions])

    return (
        <Fragment>
            <LayoutsMainContent>
                <ContentHeader name="Users"/>
                {/* Entry Content */}
                <div className="mb-4">
                    <Link to="/users/new-user" className="btn btn-secondary btn-sm">New User</Link>
                </div>
                <div className="card pb-4">
                    <div className="card-body">
                        <div className="table-responsive-sm">
                            <table className="table table-striped table-sm table-users">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Access Level</th>
                                        <th scope="col"></th>
                                        <th scope="col" className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {
                                        users.map((user, i) => {
                                            let userAccessName = ''
                                            userAccess.forEach(e => {
                                                if(e.id === user.userAccessId) userAccessName = e.name
                                            })
                                            return (
                                                <tr key={user.uid1} >
                                                    <td className="ps-2">
                                                        {i+1}
                                                    </td>
                                                    <td>
                                                        <Link to={`/users/detail/${user.uid1}`} className="user-name">
                                                            <p className="mb-0 fw-bold">{user.name}</p>
                                                        </Link>
                                                        <p className="mb-0 fw-light email">{user.email}</p>
                                                    </td>
                                                    <td>{ userAccessName }</td>
                                                    <td>{user.isActive ? 'active' : 'not active'}</td>
                                                    <td className="text-end">
                                                        <div className="btn-group" role="group" aria-label="Basic outlined example">
                                                            {/* <button type="submit" className="btn btn-outline-danger action" onClick={()=>handleDeleteContact({id, name})}>Delete</button> */}
                                                            <Link to={`/users/edit-users/${user.id}`} className="btn btn-outline-success action">Edit</Link>
                                                            <Link to={`/users/detail/${user.id}`} className="btn btn-outline-primary action">View</Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </LayoutsMainContent>
        </Fragment>
    )
}

const reduxState = (state) => ({
    transactions: state.transactions,
    users: state.users,
    userAccess: state.userAccess
})
const reduxDispatch = (dispatch) => ({
    getTransactionsFromAPI: () => dispatch(getTransactionsFromAPI()),
    getUsersFromAPI: () => dispatch(getUsersFromAPI()),
    getUserAccessFromAPI: () => dispatch(getUserAccessFromAPI()),
})

export default connect(reduxState, reduxDispatch)(Users)