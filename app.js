const queryForm1 = document.querySelector('.func1 > .query-form');
const cbalance1 = document.querySelector('.func1 > p > .cbalance');
const nbalance1 = document.querySelector('.func1 > p > .nbalance');
const status1 = document.querySelector('.func1 > p > .status');
const reset1 = document.querySelector('.reset-btn');

queryForm1.elements.timestamp.value = Math.round(new Date().getTime() / 1000) - 86400;

queryForm1.addEventListener('submit', async function(e) {
    e.preventDefault();
    const address = queryForm1.elements.address.value;
    const key = queryForm1.elements.key.value;
    const res = await checkAddressBalance(address, key);
})

const checkAddressBalance = async (address, key) => {
    try {
        const config = {params: {module: 'account', action: 'balance', address: address, tax: 'lastest', apikey: key}};
        const res = await axios.get('https://api.bscscan.com/api', config)
        if(cbalance1.innerText === '') {
            cbalance1.innerText = res.data.result;
        }
        nbalance1.innerText = res.data.result;
        if(cbalance1.innerText !== nbalance1.innerText) {
            status1.innerText = 'balance change!!! balance change!!! balance change!!!';
            cbalance1.innerText = nbalance1.innerText;
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

reset1.addEventListener('click', () => {
    cbalance1.innerText = '';
    nbalance1.innerText = '';
    status1.innerText = '';
}) 

const queryForm2 = document.querySelector('.func2 > .query-form');
const stopBtn2 = document.querySelector('.func2 > .stop-btn');
const tabletrans2 = document.querySelector('.func2 > table > .table-trans');

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
        if(res.data.result.status) dom.innerHTML = `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="25" r="10" fill="green" /></svg>`;
            else {
                dom.innerHTML = `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="25" r="10" fill="red" /></svg>`;

                const delayCheckStatus = (hash, key, dom) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            console.log('func: nextStatus');
                            checkStatus(hash, key, dom);
                        }, 500)
                    })
                }
                let nextStatus = await delayCheckTrans(address, key);
            }
    } catch(e) {
        console.log('ERROR!!!', e)
    }
}

const checkNewTrans = async (address, key) => {
    try{
        const config = {params: {module: 'account', action: 'tokentx', address: address, apikey: key, sort: 'asc'}};
        const res = await axios.get('https://api.bscscan.com/api', config)
        const transArr = res.data.result.filter(tran => tran.tokenName === "Pancake LPs").filter(tran => tran.timeStamp > queryForm2.elements.timestamp.value)
        if(!transArr.some(tran => hashArr.includes(tran.hash))) {
            const newTrans = transArr.filter(tran => !hashArr.includes(tran.hash))
            for(tran of newTrans) {
                hashArr.push(tran.hash);
                const newTr = document.createElement('tr');
                tabletrans2.append(newTr);
                const tdHash = document.createElement('td');
                tdHash.append(tran.hash);
                newTr.append(tdHash);
                
                const tdBlock = document.createElement('td');
                tdBlock.append(tran.blockNumber);
                newTr.append(tdBlock);

                const tdToken = document.createElement('td');
                tdToken.append(tran.tokenName);
                newTr.append(tdToken);

                const tdStatus = document.createElement('td');
                tdStatus.innerHTML = `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="25" r="10" fill="yellow" /></svg>`;
                newTr.append(tdStatus);
                const statusCode = checkStatus(tran.hash, key, tdStatus)
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