import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, push as pushData, ref, onValue, set, child, get, remove } from "firebase/database";


import { database } from "../../firebase";

const corp = 'yadupa'
const yadupauid = JSON.parse(localStorage.getItem(`${corp}uid`))

const setUserAccess = (userData) => {
    const { email, uid, accessToken, emailVerified } = userData
    // const { createdAt } = userData.metadata
    set(ref(database, `${corp}/userAccessToken/` + uid), {
        email,
        emailVerified,
        accessToken
    })
}
const setUsers = (userData) => {
    const { name, email, uid, createdAt } = userData
    // const { createdAt } = userData.metadata
    set(ref(database, `${corp}/users/` + uid), {
        name,
        email,
        createdAt
    })
}
// export const getUserData = () => (dispatch) => {
//     const starCountRef = ref(database, `${corp}/users/` + yadupauid);
//     return new Promise(async (resolve, reject) => {
//         onValue(starCountRef, (snapshot) => {
//             resolve(snapshot.val())
//         });
//     })
// }
const getUserAccessToken = (userId) => {
    // get once
    return new Promise((resolve, reject) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `${corp}/userAccessToken/` + userId))
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

        const {email, password, name} = data
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            dispatch({type: 'CHANGE_AUTH_LOADING', value: false})

            const { email, uid, emailVerified, accessToken, metadata } = userCredential.user
            const userData = {
                createdAt: metadata.createdAt,
                uid,
                name,
                email,
                emailVerified,
                accessToken
            }

            setUserAccess(userData)
            setUsers(userData)
            resolve(true)
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

export const loginUserAPI = (data) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({type: 'CHANGE_AUTH_LOADING', value: true})
        const auth = getAuth();
        signInWithEmailAndPassword(auth, data.email, data.password)
        .then(async(userCredential) => {

            const { email, uid, accessToken, emailVerified } = userCredential.user
            const userData = {
                uid,
                email,
                emailVerified,
                accessToken
            }

            await setUserAccess(userData)
            await localStorage.setItem(`${corp}uid`, JSON.stringify(uid))
            await localStorage.setItem(`token_${corp}uid`, JSON.stringify(accessToken))
            await dispatch({type: 'CHANGE_AUTH_LOADING', value: false})
            // await dispatch({type: 'CHANGE_IS_LOGIN', value: true})
            await resolve(userCredential.user)
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

export const addDataToAPI = (data) => (patch) => {
    const writeNoteData = (data) => {
        const { userId, title, date, content } = data
        pushData(ref(database, 'notes/' + userId), {
            title,
            content,
            date
        });
    }
    writeNoteData(data)
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
//         const starCountRef = ref(database, `${corp}/accounts/` + accountId);
//         onValue(starCountRef, (snapshot) => {
//             resolve(snapshot.val())
//         });
//     })
// }
export const addDataToAPI2 = (data) => (patch) => {
    const writeNoteData = (data) => {
        const { userId, title, date, content } = data
        pushData(ref(database, 'notes/' + userId), {
            title,
            content,
            date
        });
    }
    writeNoteData(data)
}
export const postAccountToAPI = (account) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corp}/accounts`), account)
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
        set(ref(database, `${corp}/accounts/${id}`), newAccount)
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
        remove(ref(database, `${corp}/accounts/${accountId}`))
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const setActiveAccount = (data) => (dispatch) => {
    return new Promise(resolve => {
        const { isActive, accountId } = data
        set(ref(database, `${corp}/accounts/${accountId}/isActive`), isActive)
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}
export const getAccountsFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corp}/accounts`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let accounts = []
            for( let x in temp) {
                temp[x].id = x
                accounts.push(temp[x])
            }
            accounts.sort((a, b) => {
                let tempA = Number(a.number.split('-').join(''))
                let tempB = Number(b.number.split('-').join(''))
                return tempA - tempB
            })
            dispatch({type: 'SET_ACCOUNTS', value: accounts})
            resolve(accounts)
        });
    })
}
export const getCategoriesFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corp}/categories`);
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
        pushData(ref(database, `${corp}/contacts`), contact)
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
        set(ref(database, `${corp}/contacts/${id}`), newContact)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const getContactsFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corp}/contacts`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let contacts = []
            for( let x in temp) {
                temp[x].id = x
                contacts.push(temp[x])
            }
            dispatch({type: 'SET_CONTACTS', value: contacts})
            resolve(contacts)
        });
    })
}
export const deleteContactFromAPI = (contactId) => (dispatch) => {
    return new Promise(resolve => {
        remove(ref(database, `${corp}/contacts/${contactId}`))
        .then(() => resolve(true))
        .catch(err => console.log(err))
    })
}

export const getTransactionsFromAPI = () => async (dispatch) => {
    const journalEntries = await getEntriesAPI(dispatch)
    const transactions = {
        journalEntries,
    }
    dispatch({type: 'SET_TRANSACTIONS', value: transactions})
}
export const postJournalEntryToAPI = (journalEntry) => (dispatch) => {
    return new Promise((resolve, reject) => {
        pushData(ref(database, `${corp}/transactions/journalEntries`), journalEntry)
        .then((dataCredential) => {
            resolve(dataCredential.key)
            console.log(dataCredential)
        })
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const getEntriesFromAPI = () => (dispatch) => {
    return new Promise( async (resolve) => {
        const journalEntries = await getEntriesAPI(dispatch)
        if(journalEntries) {
            dispatch({type: 'SET_ENTRIES', value: journalEntries})
            journalEntries && resolve(journalEntries)
        }
    })
}
const getEntriesAPI = (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corp}/transactions/journalEntries`);
        onValue(starCountRef, (snapshot) => {
            let temp = {...snapshot.val()}
            let journalEntries = []
            for( let x in temp) {
                temp[x].id = x
                journalEntries.push(temp[x])
            }
            // dispatch({type: 'SET_ENTRIES', value: journalEntries})
            resolve(journalEntries)
        });
    })
}
export const putIdenticalCodeToAPI = (identicalCode) => (dispatch) => {
    const {codeFor} = identicalCode
    let newIdenticalCode = {...identicalCode}
    delete newIdenticalCode.codeFor
    return new Promise((resolve, reject) => {
        set(ref(database, `${corp}/identicalCode/${codeFor}`), newIdenticalCode)
        .then(() => resolve(true))
        .catch(err => {
            console.log(err)
            reject(false)   
        })
    })
}
export const getIdenticalCodeFromAPI = () => (dispatch) => {
    return new Promise(resolve => {
        const starCountRef = ref(database, `${corp}/identicalCode`);
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

export const getDataFromAPI = (userId) => (dispatch) => {
    const starCountRef = ref(database, 'notes/' + userId);
    return new Promise((resolve, reject) => {
        onValue(starCountRef, (snapshot) => {
            let data = []
            for( let x in snapshot.val()) {
                data.push({
                    id: x,
                    data: snapshot.val()[x]
                })
            }
            dispatch({type: 'SET_NOTES', value: data})
            resolve(data)
        });
    })
}