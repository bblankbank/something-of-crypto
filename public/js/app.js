const beep = () => {
    const audio = new Audio('sound/button-3.mp3');
    audio.play();
}
    
const f1_form = document.querySelector('.f1.query-form');
const f1_cbalance = document.querySelector('.f1.cbalance');
const f1_nbalance = document.querySelector('.f1.nbalance');
const f1_status = document.querySelector('.f1.status');
const f1_lbalance = document.querySelector('.f1.li-balance');
const f1_spin = document.querySelector('.f1.spin');

f1_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const address = f1_form.elements.address.value;
    const key = f1_form.elements.key.value;
    f1_spin.classList.toggle('d-none')
    const res = await checkAddressBalance(address, key);
})

const checkAddressBalance = async (address, key) => {
    try {
        const config = {params: {module: 'account', action: 'balance', address: address, tax: 'lastest', apikey: key}};
        const res = await axios.get('https://api.bscscan.com/api', config);
        const result = (parseInt(res.data.result)/1000000000000000000).toFixed(18);
        if(f1_cbalance.innerText === '') {
            f1_cbalance.innerText = result;
            const newLi = document.createElement('li');
            newLi.append(result);
            f1_lbalance.append(newLi);
        }
        f1_nbalance.innerText = result;
        if(f1_cbalance.innerText !== f1_nbalance.innerText) {
            beep();
            f1_status.innerText = 'balance change!!!';
            f1_cbalance.innerText = result;
            const newLi = document.createElement('li');
            newLi.append(result);
            f1_lbalance.append(newLi);
        }

        const delayCheckBalance = (address, key) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    checkAddressBalance(address, key);
                }, 500)
            })
        }
        let nextTrans = await delayCheckBalance(address, key);

    } catch(e) {
        console.log('ERROR!!!', e)
    }
}

f1_status.addEventListener('click', () => {
    f1_status.innerText = '';
})

const f2_form = document.querySelector('.f2.query-form');
const f2_table = document.querySelector('.f2.table-trans');
const f2_status = document.querySelector('.form-check-input');
const f2_spin = document.querySelector('.f2.spin');

const hashArr = [];

f2_form.elements.timestamp.value = Math.round(new Date().getTime() / 1000) - 86400;

f2_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const address = f2_form.elements.address.value;
    const key = f2_form.elements.key.value;
    f2_spin.classList.toggle('d-none')
    const res = checkNewTrans(address, key);
})

const checkStatus = async (hash, key, dom) => { 
    try {
        const config = {params: {module: 'transaction', action: 'gettxreceiptstatus', txhash: hash, apikey: key}};
        const res = await axios.get('https://api.bscscan.com/api', config)
        if(res.data.result.status) {
            beep();
            dom.innerHTML = `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="10" fill="green" /></svg>`;
        } else {
                dom.innerHTML = `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="20" r="10" fill="red" /></svg>`;

                const delayCheckStatus = (hash, key, dom) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
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
        const transArr = res.data.result.filter(tran => tran.tokenName === "Pancake LPs").filter(tran => tran.timeStamp > f2_form.elements.timestamp.value)
        if(!transArr.some(tran => hashArr.includes(tran.hash))) {
            const newTrans = transArr.filter(tran => !hashArr.includes(tran.hash))
            for(tran of newTrans) {
                hashArr.push(tran.hash);
                const newTr = document.createElement('tr');
                f2_table.append(newTr);
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
                if(f2_status.checked) {
                    const statusCode = checkStatus(tran.hash, key, tdStatus)
                }
            }
        }
        const delayCheckTrans = (address, key) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    checkNewTrans(address, key);
                }, 500)
            })
        }
        let nextTrans = await delayCheckTrans(address, key);

    } catch(e) {
        console.log('ERROR!!!', e)
    }
}