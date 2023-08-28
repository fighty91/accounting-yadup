import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, push as pushData, ref, onValue, set, child, get, remove } from "firebase/database";
import { database } from "../../firebase";
import { corporation } from "../../corporation";

const corpName = corporation.name
// const yadupauid = JSON.parse(localStorage.getItem(`${corpName}uid`))

const setUserAccessToken = (userData) => {
    return new Promise((resolve, reject) => {
        const { email, uid, accessToken } = userData
        set(ref(database, `${corpName}/userAccessToken/` + uid), {
            email,
            accessToken
        }).then(() => resolve(true))
        .catch((err) => {
            console.log(err)
            reject(false)
        })
    })
}
const setUserRegister = (userData) => {
    return new Promise(async(resolve, reject) => {
        const { name, email, uid, createdAt, userAccessId } = userData
        const users = await getOnceUsers()
        let uid2 = 1
        if(users) {
            let userUid2 = []
            for( let x in users ) {
                userUid2.push(users[x].uid2)
            }
            uid2 += Math.max(...userUid2)
        }
        set(ref(database, `${corpName}/users/${uid}`), {
            uid1: uid,
            uid2,
            name,
            email,
            isActive: true,
            userAccessId,
            createdAt
        }).then(() => resolve(true))
        .catch((err) => {
            console.log(err)
            reject(false)
        })
    })
}
// export const getUserData = () => (dispatch) => {
//     const starCountRef = ref(database, `${corpName}/users/` + yadupauid);
//     return new Promise(async (resolve, reject) => {
//         onValue(starCountRef, (snapshot) => {
//             resolve(snapshot.val())
//         });
//     })
// }
const getOnceUsers = () => {
    // get once
    return new Promise((resolve) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/users`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val())
            } else {
                resolve(snapshot.val())
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    })
}
const getUserAccessToken = (userId) => {
    // get once
    return new Promise((resolve, reject) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/userAccessToken/` + userId))
        .then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val())
            } else {
                resolve(snapshot.val())
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
            reject(false)
        });
    })
}
export const getCheckToken = ({accessToken, userId}) => async (dispatch) => {
    const userData = await getUserAccessToken(userId)
    let tokenMatch = false
    if(userData && accessToken === userData.accessToken) {
        await dispatch({type: 'CHANGE_IS_LOGIN', value: true})
        tokenMatch = true
    }
    return tokenMatch
}
export const registerUserAPI = (data) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({type: 'CHANGE_AUTH_LOADING', value: true})

        const {email, password, name, userAccessId} = data
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
        .then(async(userCredential) => {
            // Signed in 
            const { email, uid, accessToken, metadata } = userCredential.user
            const userData = {
                createdAt: metadata.createdAt,
                uid,
                name,
                email,
                userAccessId,
                accessToken
            }
            let res = false
            const res2 = await setUserAccessToken(userData)
            const res3 = await setUserRegister(userData)
            if(res2 && res3) {
                res = true
                dispatch({type: 'CHANGE_AUTH_LOADING', value: false})
            }
            resolve(res)
        })
        .catch((error) => {
            resolve(false)
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
            dispatch({type: 'CHANGE_AUTH_LOADING', value: false})
        })
    })
}

export const loginUserAPI = (data) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({type: 'CHANGE_AUTH_LOADING', value: true})
        const auth = getAuth();
        signInWithEmailAndPassword(auth, data.email, data.password)
        .then(async(userCredential) => {

            const { email, uid, accessToken } = userCredential.user
            const userData = {
                uid,
                email,
                accessToken
            }
            await setUserAccessToken(userData)
            localStorage.setItem(`${corpName}uid`, JSON.stringify(uid))
            localStorage.setItem(`token_${corpName}uid`, JSON.stringify(accessToken))
            await dispatch({type: 'CHANGE_AUTH_LOADING', value: false})
            resolve(userCredential.user)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
            dispatch({type: 'CHANGE_AUTH_LOADING', value: false})
            reject(false)
        });
    })
}

export const logoutUserAPI = () => (dispatch) => {
    const auth = getAuth();
    signOut(auth).then(() => {
        console.log('Logged out')
        dispatch({type: 'CHANGE_IS_LOGIN', value: false})
    }).catch((error) => {
        console.log(error)
    });
}

// export const addDataToAPI = (data) => (patch) => {
//     // writeUserData(data.userId, data.title)
//     const writeUserData = (data) => {
//         const { userId, title, date, content } = data
//         const db = getDatabase();
//         console.log(userId)
//         set(ref(db, 'notes/' + userId), {
//             title,
//             content,
//             date
//         });
//     }
//     writeUserData(data)
// }

// export const getAccountFromAPI = (accountId) => (dispatch) => {
//     return new Promise(resolve => {
//         const starCountRef = ref(database, `${corpName}/accounts/` + accountId);
//         onValue(starCountRef, (snapshot) => {
//             resolve(snapshot.val())
//         });
//     })
// }
export const getUserFromAPI = (userId) => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/users/${userId}`);
        onValue(starCountRef, (snapshot) => {
            const user = snapshot.val()
            dispatch({type: 'SET_USER', value: user})
            resolve(user)
        });
    })
}
export const getUsersFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/users`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let users = []
            for( let x in temp) {
                users.push(temp[x])
            }
            users.sort((a, b) => 
                a.name < b.name ? -1 :
                a.name > b.name ? 1 : 0
            )
            users.sort((a, b) => 
                a.userAccessId < b.userAccessId ? -1 :
                a.userAccessId > b.userAccessId ? 1 : 0
            )
            dispatch({type: 'SET_USERS', value: users})
            resolve(users)
        });
    })
}
export const getUserAccessFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/userAccess`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let userAccess = []
            for( let x in temp) {
                userAccess.push(temp[x])
            }
            dispatch({type: 'SET_USERACCESS', value: userAccess})
            resolve(userAccess)
        });
    })
}
export const postAccountToAPI = (account) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corpName}/accounts`), account)
        .then((dataCredential) => {
            resolve(dataCredential.key)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const putAccountToAPI = (account) => (dispatch) => {
    const {id} = account
    let newAccount = {...account}
    delete newAccount.id
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/accounts/${id}`), newAccount)
        .then(() => {
            resolve(true)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const deleteAccountFromAPI = (accountId) => (dispatch) => {
    return new Promise(resolve => {
        remove(ref(database, `${corpName}/accounts/${accountId}`))
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const setActiveAccount = (data) => (dispatch) => {
    return new Promise(resolve => {
        const { isActive, accountId } = data
        set(ref(database, `${corpName}/accounts/${accountId}/isActive`), isActive)
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const getAccountsFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/accounts`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let accounts = []
            for( let x in temp) {
                temp[x].id = x
                accounts.push(temp[x])
            }
            accounts.sort((a, b) => 
                a.number < b.number ? -1 :
                a.number > b.number ? 1 : 0
            )
            dispatch({type: 'SET_ACCOUNTS', value: accounts})
            resolve(accounts)
        });
    })
}
export const getCategoriesFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/categories`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let categories = []
            for( let x in temp) {
                temp[x].id = x
                categories.push(temp[x])
            }
            dispatch({type: 'SET_CATEGORIES', value: categories})
            resolve(categories)
        });
    })
}
export const postContactToAPI = (contact) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corpName}/contacts`), contact)
        .then((dataCredential) => {
            resolve(dataCredential.key)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const putContactToAPI = (contact) => (dispatch) => {
    const {id} = contact
    let newContact = {...contact}
    delete newContact.id
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/contacts/${id}`), newContact)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const getContactFromAPI = (id) => () => {
    // get once
    return new Promise((resolve) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/contacts/${id}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const tempReceipt = {...snapshot.val(), id}
                resolve(tempReceipt)
            } else {
                resolve(snapshot.val())
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const getContactsFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/contacts`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let contacts = []
            for( let x in temp) {
                temp[x].id = x
                contacts.push(temp[x])
            }
            contacts.sort((a, b) => 
                a.name < b.name ? -1 :
                a.name > b.name ? 1 : 0
            )
            dispatch({type: 'SET_CONTACTS', value: contacts})
            resolve(contacts)
        });
    })
}
export const deleteContactFromAPI = (contactId) => (dispatch) => {
    return new Promise(resolve => {
        remove(ref(database, `${corpName}/contacts/${contactId}`))
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}

export const getTransactionsFromAPI = () => async (dispatch) => {
    await getEntriesFromAPI()(dispatch)
    await getPaymentJournalsFromAPI()(dispatch)
    await getReceiptJournalsFromAPI()(dispatch)
}

export const postReceiptJournalToAPI = (receiptJournal) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corpName}/transactions/receiptJournal`), receiptJournal)
        .then((dataCredential) => {
            resolve(dataCredential.key)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const putReceiptJournalToAPI = (receiptJournal) => (dispatch) => {
    const {id} = receiptJournal
    let newReceiptJournal = {...receiptJournal}
    delete newReceiptJournal.id
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/transactions/receiptJournal/${id}`), newReceiptJournal)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const deleteReceiptJournalFromAPI = (transId) => (dispatch) => {
    return new Promise(resolve => {
        remove(ref(database, `${corpName}/transactions/receiptJournal/${transId}`))
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const getReceiptJournalFromAPI = (id) => () => {
    // get once
    return new Promise((resolve) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/transactions/receiptJournal/${id}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const tempReceipt = {...snapshot.val(), id}
                resolve(tempReceipt)
            } else {
                resolve(snapshot.val())
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const getReceiptJournalsFromAPI = () => (dispatch) => {
    return new Promise( async (resolve) => {
        const starCountRef = ref(database, `${corpName}/transactions/receiptJournal`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let receiptJournal = []
            for( let x in temp) {
                temp[x].id = x
                receiptJournal.push(temp[x])
            }
            receiptJournal.sort((a, b) => 
                a.transNumber < b.transNumber ? 1 :
                a.transNumber > b.transNumber ? -1 : 0
            )
            receiptJournal.sort((a, b) => 
                a.date < b.date ? 1 :
                a.date > b.date ? -1 : 0
            )
            dispatch({type: 'SET_RECEIPT_JOURNAL', value: receiptJournal})
            resolve(receiptJournal)
        });
    })
}
export const postPaymentJournalToAPI = (paymentJournal) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corpName}/transactions/paymentJournal`), paymentJournal)
        .then((dataCredential) => {
            resolve(dataCredential.key)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const putPaymentJournalToAPI = (paymentJournal) => (dispatch) => {
    const {id} = paymentJournal
    let newPaymentJournal = {...paymentJournal}
    delete newPaymentJournal.id
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/transactions/paymentJournal/${id}`), newPaymentJournal)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const deletePaymentJournalFromAPI = (transId) => (dispatch) => {
    return new Promise(resolve => {
        remove(ref(database, `${corpName}/transactions/paymentJournal/${transId}`))
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const getPaymentJournalFromAPI = (id) => () => {
    // get once
    return new Promise((resolve) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/transactions/paymentJournal/${id}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const tempPayment = {...snapshot.val(), id}
                resolve(tempPayment)
            } else {
                // resolve(snapshot.val())
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const getPaymentJournalsFromAPI = () => (dispatch) => {
    return new Promise( async (resolve) => {
        const starCountRef = ref(database, `${corpName}/transactions/paymentJournal`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let paymentJournal = []
            for( let x in temp) {
                temp[x].id = x
                paymentJournal.push(temp[x])
            }
            paymentJournal.sort((a, b) => 
                a.transNumber < b.transNumber ? 1 :
                a.transNumber > b.transNumber ? -1 : 0
            )
            paymentJournal.sort((a, b) => 
                a.date < b.date ? 1 :
                a.date > b.date ? -1 : 0
            )
            dispatch({type: 'SET_PAYMENT_JOURNAL', value: paymentJournal})
            resolve(paymentJournal)
        });
    })
}

export const postJournalEntryToAPI = (journalEntry) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corpName}/transactions/journalEntries`), journalEntry)
        .then((dataCredential) => {
            resolve(dataCredential.key)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const putJournalEntryToAPI = (journalEntry) => (dispatch) => {
    const {id} = journalEntry
    let newJournalEntry = {...journalEntry}
    delete newJournalEntry.id
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/transactions/journalEntries/${id}`), newJournalEntry)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const deleteJournalEntryFromAPI = (transId) => (dispatch) => {
    return new Promise(resolve => {
        remove(ref(database, `${corpName}/transactions/journalEntries/${transId}`))
        .then(() => resolve(true))
        .catch(err => console.log('error',err))
    })
}
export const getJournalEntryFromAPI = (id) => () => {
    // get once
    return new Promise((resolve) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/transactions/journalEntries/${id}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const tempEntries = {...snapshot.val(), id}
                resolve(tempEntries)
            } else {
                // resolve(snapshot.val())
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const getEntriesFromAPI = () => (dispatch) => {
    return new Promise( async (resolve) => {
        const starCountRef = ref(database, `${corpName}/transactions/journalEntries`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let journalEntries = []
            for( let x in temp) {
                temp[x].id = x
                journalEntries.push(temp[x])
            }
            journalEntries.sort((a, b) => 
                a.transNumber < b.transNumber ? 1 :
                a.transNumber > b.transNumber ? -1 : 0
            )
            journalEntries.sort((a, b) => 
                a.date < b.date ? 1 :
                a.date > b.date ? -1 : 0
            )
            dispatch({type: 'SET_ENTRIES', value: journalEntries})
            resolve(journalEntries)
        });
    })
}
export const postOpeningBalanceToAPI = (openingBalance) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corpName}/transactions/openingBalance`), openingBalance)
        .then((dataCredential) => {
            resolve(dataCredential.key)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const putOpeningBalanceToAPI = (openingBalance) => (dispatch) => {
    const {id} = openingBalance
    let newOpeningBalance = {...openingBalance}
    delete newOpeningBalance.id
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/transactions/openingBalance/${id}`), newOpeningBalance)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const deleteOpeningBalanceFromAPI = (transId) => (dispatch) => {
    return new Promise(resolve => {
        remove(ref(database, `${corpName}/transactions/openingBalance/${transId}`))
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const getOpeningBalanceFromAPI = () => (dispatch) => {
    return new Promise( async (resolve) => {
        const starCountRef = ref(database, `${corpName}/transactions/openingBalance`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let openingBalance = []
            for( let x in temp) {
                temp[x].id = x
                openingBalance.push(temp[x])
            }
            openingBalance.sort((a, b) => 
                a.transNumber < b.transNumber ? 1 :
                a.transNumber > b.transNumber ? -1 : 0
            )
            openingBalance.sort((a, b) => 
                a.date < b.date ? 1 :
                a.date > b.date ? -1 : 0
            )
            dispatch({type: 'SET_OPENING_BALANCE', value: openingBalance})
            resolve(openingBalance)
        });
    })
}

export const putIdenticalCodeToAPI = (identicalCode) => (dispatch) => {
    const {codeFor} = identicalCode
    let newIdenticalCode = {...identicalCode}
    delete newIdenticalCode.codeFor
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/identicalCode/${codeFor}`), newIdenticalCode)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const getIdenticalCodeFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/identicalCode`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let identicalCode = []
            for( let x in temp) {
                const tempCodeList = temp[x].codeList
                let codeList = []
                for (let i in tempCodeList) {
                    codeList.push(tempCodeList[i])
                }
                let tempIdentical = {
                    ...temp[x],
                    codeFor: x,
                    codeList
                }
                identicalCode.push(tempIdentical)
            }
            dispatch({type: 'SET_IDENTICAL_CODE', value: identicalCode})
            resolve(identicalCode)
        });
    })
}