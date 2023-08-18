import React, { Component } from "react";
import './App.scss'
import 'bootstrap';
import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accounts from "../Accounts";
import CashAndBank from "../CashAndBank";
import Contacts from "../Contacts";
import JournalEntries from "../JournalEntries";
import Reports from "../Reports";
import DetailAccount from "../Accounts/DetailAccount";
import CreateUpdateAccount from "../Accounts/CreateUpdateAccount";
import DetailContact from "../Contacts/DetailContact";
import EditContact from "../Contacts/EditContact";
import NewContact from "../Contacts/NewContact";
import TransactionsContact from "../Contacts/TransactionsContact";
import CreateUpdateEntries from "../JournalEntries/CreateUpdateEntries";
import DetailJournalEntries from "../JournalEntries/DetailJournalEntries";
import BalanceSheet from "../Reports/BalanceSheet/BalanceSheet";
import Dashboard from "../Dashboard";
import Login from "../Login";
import Register from "../Register";
import Logout from "../Logout";
import Users from "../Users";

class App extends Component {
    render() {
        return (
            <Router>
                <Routes>
                    <Route path="/" exact Component={Dashboard} />
                    <Route path="/accounts" Component={Accounts}/>
                    <Route path="/cash-and-bank" Component={CashAndBank}/>
                    <Route path="/contacts" Component={Contacts}/>
                    <Route path="/journal-entries" Component={JournalEntries}/>
                    <Route path="/reports" Component={Reports}/>

                    <Route path="/accounts/account-detail/:accountId" Component={DetailAccount}/>
                    <Route path="/accounts/edit-account/:accountId" Component={CreateUpdateAccount}/>
                    <Route path="/accounts/new-account" Component={CreateUpdateAccount}/>
                    
                    <Route path="/contacts/detail/:contactId" Component={DetailContact}/>
                    <Route path="/contacts/edit-contact/:contactId" Component={EditContact}/>
                    <Route path="/contacts/new-contact" Component={NewContact}/>
                    <Route path="/contacts/transactions/:contactId" Component={TransactionsContact}/>

                    <Route path="/journal-entries/edit-transaction/:transId" Component={CreateUpdateEntries}/>
                    <Route path="/journal-entries/new-transaction" Component={CreateUpdateEntries}/>
                    <Route path="/journal-entries/transaction-detail/:transId" Component={DetailJournalEntries}/>
                    
                    <Route path="/reports/balance-sheet" Component={BalanceSheet}/>

                    <Route path="/users" Component={Users} />
                    <Route path="/login" Component={Login} />
                    <Route path="/register" Component={Register} />
                    <Route path="/logout" Component={Logout} />
                </Routes>
            </Router>
        )
    }
}


export default App