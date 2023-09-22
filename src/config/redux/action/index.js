import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getDatabase, push as pushData, ref, onValue, set, child, get, remove } from "firebase/database";
import { database } from "../../firebase";
import { corporation } from "../../corporation";
import Swal from "sweetalert2";

const corpName = corporation.name
// const yadupauid = JSON.parse(localStorage.getItem(`${corpName}uid`))

const lostConnection = () => Swal.fire({
    title: 'Offline!',
    text: 'Sorry, your internet connection is lost!!',
    icon: 'warning',
    confirmButtonColor: '#fd7e14'
})

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
        const { name, email, password, uid, createdAt, userAccessId } = userData
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
            password,
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
const getUser = (uid) => {
    // get once
    return new Promise((resolve) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/users/${uid}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val())
            } else {
                resolve(snapshot.val())
            }
        }).catch((error) => {
            console.error(error);
        });
    })
}
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
    if(tokenMatch) {
        const user = await getUser(userId)
        const {email, password} = user
        loginUserAPI({email, password})(dispatch)
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
                password,
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
            console.log('login')
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

export const resetUserPasswordAPI = (data) => (dispatch) => {
    return new Promise((resolve, reject) => {
        const auth = getAuth();
        sendPasswordResetEmail(auth, data)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)
        })
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
    delete newAccount.amount
    delete newAccount.categoryName
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
export const getAccountFromAPI = (id) => () => {
    // get once
    return new Promise((resolve) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/accounts/${id}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const temp = {...snapshot.val(), id}
                resolve(temp)
            } else {
                resolve(snapshot.val())
                console.log("No account available");
            }
        }).catch((error) => {
            console.error(error);
        });
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
                const temp = {...snapshot.val(), id}
                resolve(temp)
            } else {
                resolve(snapshot.val())
                console.log("No contact available");
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
    await getJournalEntriesFromAPI()(dispatch)
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
        if(window.navigator.onLine) {
            remove(ref(database, `${corpName}/transactions/receiptJournal/${transId}`))
            .then(() => resolve(true))
            .catch(err => console.log(err))
        }
        else lostConnection()
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
            // receiptJournal.sort((a, b) => 
            //     a.transNumber < b.transNumber ? 1 :
            //     a.transNumber > b.transNumber ? -1 : 0
            // )
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
        if(window.navigator.onLine) {
            remove(ref(database, `${corpName}/transactions/paymentJournal/${transId}`))
            .then(() => resolve(true))
            .catch(err => console.log(err))
        }
        else lostConnection()
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
                resolve(snapshot.val())
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
        if(window.navigator.onLine) {
            remove(ref(database, `${corpName}/transactions/journalEntries/${transId}`))
            .then(() => resolve(true))
            .catch(err => console.log('error',err))
        }
        else lostConnection()
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
                resolve(snapshot.val())
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const getJournalEntriesFromAPI = () => (dispatch) => {
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
        if(window.navigator.onLine) {
            remove(ref(database, `${corpName}/transactions/openingBalance/${transId}`))
            .then(() => resolve(true))
            .catch(err => console.log(err))
        }
        else lostConnection()
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
            dispatch({type: 'SET_OPENING_BALANCE', value: openingBalance})
            resolve(openingBalance)
        });
    })
}

export const postIdenticalCodeToAPI = ({initialCode, codeFor, newIdentical}) => (dispatch) => {
    let identicalActive = false,
    temp = {...newIdentical}
    return new Promise(async(resolve, reject) => {
        const dbRef = ref(getDatabase());
        await get(child(dbRef, `${corpName}/identicalCode/${codeFor}/codeList/${initialCode}`))
        .then((snapshot) => {
            if(snapshot.exists()) {
                const {lastOrder, isActive} = snapshot.val()
                temp.lastOrder = lastOrder
                identicalActive = isActive
            }
        })
        
        if(!identicalActive)
        await set(ref(database, `${corpName}/identicalCode/${codeFor}/codeList/${initialCode}`), temp)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const deleteIdentical = ({initialCode, codeFor}) => (dispatch) => {
    return new Promise((resolve, reject) => {
        // remove(ref(database, `${corpName}/identicalCode/${codeFor}/codeList/${initialCode}`))
        set(ref(database, `${corpName}/identicalCode/${codeFor}/codeList/${initialCode}/isActive`), false)
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const chooseIdentical = ({initialCode, codeFor}) => (dispatch) => {
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/identicalCode/${codeFor}/lastCode`), initialCode || 'defaultCode')
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
            for(let x in temp) {
                const tempCodeList = temp[x].codeList
                let codeList = []
                for (let i in tempCodeList) {
                    if(tempCodeList[i].isActive) {
                        const tempCL = {...tempCodeList[i], initialCode: i}
                        i !== 'defaultCode' && codeList.push(tempCL)
                    }
                }
                codeList.sort((a, b) => a.initialCode < b.initialCode ? 1 : a.initialCode > b.initialCode ? -1 : 0)
                for (let i in tempCodeList) {
                    if(i === 'defaultCode') {
                        const tempCL = {...tempCodeList[i], initialCode: ''}
                        codeList.unshift(tempCL)
                    }
                }
                temp[x].codeList = codeList
            }
            dispatch({type: 'SET_IDENTICAL_CODE', value: temp})
            resolve(temp)
        });
    })
}

export const incrementLastOrderTNFromAPI = ({tempStart, tNParams, codeFor}) => (dispatch) => {
    // get once
    return new Promise(resolve => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/identicalCode/${codeFor}/codeList/${tNParams}/lastOrder`))
        .then(async(snapshot) => {
                let temp = snapshot.val()
                temp < tempStart ?
                temp = tempStart : temp++
                // update last ordernya
                await set(ref(database, `${corpName}/identicalCode/${codeFor}/codeList/${tNParams}/lastOrder`), temp).then()
                .catch(err => console.log(err))
                resolve(temp)
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const postNumberListToAPI = ({tempNumber, tNParams, codeFor}) => (dispatch) => {
    return new Promise((resolve, reject) => {
        const temp = {
            transNumber: tempNumber,
            createdAt: Date.now()
        }
        pushData(ref(database, `${corpName}/numberList/${codeFor}/${tNParams}`), temp)
        .then((dataCredential) => resolve(dataCredential.key))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const putNumberListToAPI = ({tempTN, tNParams, codeFor}) => (dispatch) => {
    const {id} = tempTN
    let temp = {...tempTN}
    delete temp.id
    return new Promise((resolve, reject) => {
        set(ref(database, `${corpName}/numberList/${codeFor}/${tNParams}/${id}`), temp)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const deleteNumberListFromAPI = ({tNId, tNParams, codeFor}) => (dispatch) => {
    return new Promise(resolve => {
        if(window.navigator.onLine) {
            remove(ref(database, `${corpName}/numberList/${codeFor}/${tNParams}/${tNId}`))
            .then(() => resolve(true))
            .catch(err => console.log(err))
        }
        else lostConnection()
    })
}
export const getTransNumberFromAPI = ({tNId, tNParams, codeFor}) => (dispatch) => {
    // get once
    return new Promise(resolve => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/numberList/${codeFor}/${tNParams}/${tNId}/transNumber`))
        .then((snapshot) => {
            if(snapshot.exists()) {
                let temp = snapshot.val()
                if(tNParams !== 'defaultCode') temp = `${tNParams}.${temp}`
                resolve(temp)
            } else resolve(snapshot.exists())
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const getNumberListFromAPI = ({tNParams, codeFor}) => (dispatch) => {
    // get once
    return new Promise(resolve => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corpName}/numberList/${codeFor}/${tNParams}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                let numberList = []
                let temp = {...snapshot.val()}
                for(let x in temp) {
                    temp[x].id = x
                    numberList.push(temp[x])
                }
                numberList.sort((a, b) => 
                    a.createdAt < b.createdAt ? -1 :
                    a.createdAt > b.createdAt ? 1 : 0
                )
                resolve(numberList)
            } else resolve(snapshot.exists())
        }).catch((error) => {
            console.error(error);
        });
    })
}
export const getAllNumberListFromAPI = (codeFor) => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corpName}/numberList/${codeFor}`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()},
            type, value = {}
            for(let params in temp) {
                value[params] = []
                const tempParams = temp[params]
                for(let x in tempParams) {
                    tempParams[x].id = x
                    value[params].push(tempParams[x])
                }
            }
            for(let x in value) {
                value[x].sort((a, b) => 
                    a.createdAt < b.createdAt ? -1 :
                    a.createdAt > b.createdAt ? 1 : 0
                )
            }
            switch (codeFor) {
                case 'receiptJournal':
                    type = 'SET_NUMBER_LIST_RECEIPT_JOURNAL'
                    break
                case 'paymentJournal':
                    type = 'SET_NUMBER_LIST_PAYMENT_JOURNAL'
                    break
                case 'journalEntries':
                    type = 'SET_NUMBER_LIST_JOURNAL_ENTRIES'
                    break
                default:
                    break
            }
            dispatch({type, value})
            resolve(value)
        })
    })
}