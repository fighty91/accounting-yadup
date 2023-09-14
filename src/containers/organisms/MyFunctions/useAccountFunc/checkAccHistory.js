const checkAccHistory = async (data) => {
    const { account, transactions, contacts, accounts } = data
    const { id, isParent } = account

    let transCount = 0
    transactions.forEach(e => {
        e.transAccounts.find(a => a.account === id) && transCount++
    })

    let childCount = 0
    isParent && accounts.find(e => e.parentId === id) && childCount++
    
    let masterAcc = 0
    accounts.find(e => e.masterId === id) && masterAcc++
    
    let contactCount = 0
    const contact = contacts.find(e => {
        const { expensePayable, accountPayable, accountReceivable } = e.defaultAccount
        return expensePayable === id || accountPayable === id || accountReceivable === id 
    })

    contact && contactCount++
    return { childCount, transCount, masterAcc, contactCount }
}
    
export {checkAccHistory}