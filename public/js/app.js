const queryForm1 = document.querySelector('.f1.query-form');
const cbalance1 = document.querySelector('.f1.cbalance');
const nbalance1 = document.querySelector('.f1.nbalance');
const status1 = document.querySelector('.f1.status');
// const reset1 = document.querySelector('.f1.reset-btn');
const libalance1 = document.querySelector('.f1.li-balance');

queryForm1.addEventListener('submit', async function(e) {
    e.preventDefault();
    const address = queryForm1.elements.address.value;
    const key = queryForm1.elements.key.value;
    const res = await checkAddressBalance(address, key);
})

const checkAddressBalance = async (address, key) => {
    try {
        const config = {params: {module: 'account', action: 'balance', address: address, tax: 'lastest', apikey: key}};
        const res = await axios.get('https://api.bscscan.com/api', config);
        if(cbalance1.innerText === '') {
            cbalance1.innerText = res.data.result;
            const newLi = document.createElement('li');
            newLi.append(res.data.result);
            libalance1.append(newLi);
        }
        nbalance1.innerText = res.data.result;
        if(cbalance1.innerText !== nbalance1.innerText) {
            status1.innerText = 'balance change!!!';
            cbalance1.innerText = nbalance1.innerText;
            const newLi = document.createElement('li');
            newLi.append(res.data.result);
            libalance1.append(newLi);
        }

        const delayCheckBalance = (address, key) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('func: nextBalance');
                    checkAddressBalance(address, key);
                }, 500)
            })
        }
        let nextTrans = await delayCheckBalance(address, key);

    } catch(e) {
        console.log('ERROR!!!', e)
    }
}

// reset1.addEventListener('click', () => {
//     cbalance1.innerText = '';
//     nbalance1.innerText = '';
//     status1.innerText = '';
// }) 

status1.addEventListener('click', () => {
    status1.innerText = '';
})

const queryForm2 = document.querySelector('.f2.query-form');
const tabletrans2 = document.querySelector('.f2.table-trans');
const statusCheck2 = document.querySelector('.form-check-input')

const hashArr = [];

queryForm2.elements.timestamp.value = Math.round(new Date().getTime() / 1000) - 86400;

queryForm2.addEventListener('submit', async function(e) {
    e.preventDefault();
    const address = queryForm2.elements.address.value;
    const key = queryForm2.elements.key.value;
    const res = checkNewTrans(address, key);
})

const checkStatus = async (hash, key, dom) => { 
    try {
        const config = {params: {module: 'transaction', action: 'gettxreceiptstatus', txhash: hash, apikey: key}};
        const res = await axios.get('https://api.bscscan.com/api', config)
        if(res.data.result.status) dom.innerHTML = `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="10" fill="green" /></svg>`;
            else {
                dom.innerHTML = `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="10" fill="red" /></svg>`;

                const delayCheckStatus = (hash, key, dom) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            console.log('func: nextStatus');
                            checkStatus(hash, key, dom);
                        }, 1000)
                    })
                }
                let nextStatus = await delayCheckStatus(address, key);
            }
    } catch(e) {
        console.log('ERROR!!!', e)
    }
}

const checkNewTrans = async (address, key) => {
    try{
        const config = {params: {module: 'account', action: 'tokentx', address: address, apikey: key, sort: 'asc'}};
        const res = await axios.get('https://api.bscscan.com/api', config);
        const transArr = res.data.result.filter(tran => tran.tokenName === "Pancake LPs").filter(tran => tran.timeStamp > queryForm2.elements.timestamp.value)
        if(!transArr.some(tran => hashArr.includes(tran.hash))) {
            const newTrans = transArr.filter(tran => !hashArr.includes(tran.hash))
            for(tran of newTrans) {
                hashArr.push(tran.hash);
                const newTr = document.createElement('tr');
                tabletrans2.append(newTr);
                const tdHash = document.createElement('td');
                tdHash.innerHTML = `<a href='https://bscscan.com/tx/${tran.hash}' target='_blank'>${tran.hash}</a>`;
                newTr.append(tdHash);
                
                const tdBlock = document.createElement('td');
                tdBlock.append(tran.blockNumber);
                newTr.append(tdBlock);

                const tdToken = document.createElement('td');
                tdToken.append(tran.tokenName);
                newTr.append(tdToken);

                const tdStatus = document.createElement('td');
                newTr.append(tdStatus);
                if(statusCheck2.checked) {
                    const statusCode = checkStatus(tran.hash, key, tdStatus)
                }
            }
        }
        const delayCheckTrans = (address, key) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('func: nextTrans');
                    checkNewTrans(address, key);
                }, 500)
            })
        }
        let nextTrans = await delayCheckTrans(address, key);

    } catch(e) {
        console.log('ERROR!!!', e)
    }
}