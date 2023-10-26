import React, { Component } from "react";
import './App.scss'
import 'bootstrap';
import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accounts from "../Accounts";
import PaymentJournal from "../PaymentJournal";
import Contacts from "../Contacts";
import JournalEntries from "../JournalEntries";
import Reports from "../Reports";
import DetailAccount from "../Accounts/DetailAccount";
import DetailContact from "../Contacts/DetailContact";
import EditContact from "../Contacts/EditContact";
import NewContact from "../Contacts/NewContact";
import TransactionsContact from "../Contacts/TransactionsContact";
import CreateUpdateEntries from "../JournalEntries/CreateUpdateEntries";
import DetailJournalEntries from "../JournalEntries/DetailJournalEntries";
import BalanceSheet from "../Reports/BalanceSheet";
import Dashboard from "../Dashboard";
import Login from "../Login";
import Logout from "../Logout";
import Users from "../Users";
import NewUser from "../Users/NewUser";
import CreateUpdatePaymentJournal from "../PaymentJournal/CreateUpdatePaymentJournal";
import ReceiptJournal from "../ReceiptJournal";
import CreateUpdateReceiptJournal from "../ReceiptJournal/CreateUpdateReceiptJournal";
import DetailReceiptJournal from "../ReceiptJournal/DetailReceiptJournal";
import DetailPaymentJournal from "../PaymentJournal/DetailPaymentJournal";
import OpeningBalance from "../OpeningBalance";
import CreateUpdateOpeningBalance from "../OpeningBalance/CreateUpdateOpeningBalance";
import EditAccount from "../Accounts/EditAccount";
import NewAccount from "../Accounts/NewAccount";
import ForgotPassword from "../Login/ForgotPassword";
import CreateUpdateClosingJournal from "../ClosingJournal/CreateUpdateClosingJournal";
import DetailClosingJournal from "../ClosingJournal/DetailClosingJournal";
import ClosingJournal from "../ClosingJournal";
import Settings from "../Settings";
import MappingAccounts from "../Settings/MappingAccounts";
import StatementOfChangesInNetAssets from "../Reports/StatementOfChangesInNetAssets";
import ComprehensiveIncomeReport from "../Reports/ComprehensiveIncomeReport";
import TrialBalance from "../Reports/TrialBalance";

class App extends Component {
    render() {
        return (
            <Router>
                <Routes>
                    <Route path="/" exact Component={Dashboard} />
                    <Route path="/accounts" Component={Accounts}/>
                    <Route path="/contacts" Component={Contacts}/>
                    <Route path="/receipt-journal" Component={ReceiptJournal}/>
                    <Route path="/payment-journal" Component={PaymentJournal}/>
                    <Route path="/journal-entries" Component={JournalEntries}/>
                    <Route path="/closing-journal" Component={ClosingJournal}/>
                    <Route path="/opening-balance" Component={OpeningBalance}/>
                    <Route path="/reports" Component={Reports}/>
                    <Route path="/settings" Component={Settings}/>

                    <Route path="/accounts/account-detail/:accountId" Component={DetailAccount}/>
                    <Route path="/accounts/edit-account/:accountId" Component={EditAccount}/>
                    <Route path="/accounts/new-account" Component={NewAccount}/>
                    
                    <Route path="/contacts/detail/:contactId" Component={DetailContact}/>
                    <Route path="/contacts/edit-contact/:contactId" Component={EditContact}/>
                    <Route path="/contacts/new-contact" Component={NewContact}/>
                    <Route path="/contacts/transactions/:contactId" Component={TransactionsContact}/>

                    <Route path="/receipt-journal/edit-transaction/:transId" Component={CreateUpdateReceiptJournal}/>
                    <Route path="/receipt-journal/new-transaction" Component={CreateUpdateReceiptJournal}/>
                    <Route path="/receipt-journal/transaction-detail/:transId" Component={DetailReceiptJournal}/>

                    <Route path="/payment-journal/edit-transaction/:transId" Component={CreateUpdatePaymentJournal}/>
                    <Route path="/payment-journal/new-transaction" Component={CreateUpdatePaymentJournal}/>
                    <Route path="/payment-journal/transaction-detail/:transId" Component={DetailPaymentJournal}/>

                    <Route path="/journal-entries/edit-transaction/:transId" Component={CreateUpdateEntries}/>
                    <Route path="/journal-entries/new-transaction" Component={CreateUpdateEntries}/>
                    <Route path="/journal-entries/transaction-detail/:transId" Component={DetailJournalEntries}/>

                    <Route path="/closing-journal/edit-transaction/:transId" Component={CreateUpdateClosingJournal}/>
                    <Route path="/closing-journal/new-transaction" Component={CreateUpdateClosingJournal}/>
                    <Route path="/closing-journal/transaction-detail/:transId" Component={DetailClosingJournal}/>

                    <Route path="/opening-balance/create-opening-balance" Component={CreateUpdateOpeningBalance}/>
                    <Route path="/opening-balance/update-opening-balance" Component={CreateUpdateOpeningBalance}/>

                    <Route path="/settings/mapping-accounts" Component={MappingAccounts}/>
                    
                    <Route path="/reports/balance-sheet" Component={BalanceSheet}/>
                    <Route path="/reports/statement-of-change-net-assets" Component={StatementOfChangesInNetAssets}/>
                    <Route path="/reports/comprehensive-income-report" Component={ComprehensiveIncomeReport}/>
                    <Route path="/reports/trial-balance" Component={TrialBalance}/>

                    <Route path="/users" Component={Users} />
                    <Route path="/users/new-user" Component={NewUser} />
                    <Route path="/login" Component={Login} />
                    <Route path="/forgot-password" Component={ForgotPassword} />
                    <Route path="/logout" Component={Logout} />
                </Routes>
            </Router>
        )
    }
}


export default App