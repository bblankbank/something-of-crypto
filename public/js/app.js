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

let f1_tbalance = 0;

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
            f1_tbalance = result;
            f1_cbalance.innerText = result;
            f1_nbalance.innerText = result;
            const newLi = document.createElement('li');
            newLi.append(result);
            f1_lbalance.append(newLi);
        }
        //f1_nbalance.innerText = result;
        f1_tbalance = result
        if(f1_nbalance.innerText !== f1_tbalance) {
            beep();
            f1_status.innerText = 'balance change!!!';
            f1_nbalance.innerText = result;
            const newLi = document.createElement('li');
            newLi.append(result);
            f1_lbalance.append(newLi);
        }

        const delayCheckBalance = (address, key) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    checkAddressBalance(address, key);
                }, 200)
            })
        }
        let nextTrans = await delayCheckBalance(address, key);

    } catch(e) {
        console.log('ERROR!!!', e)
    }
}

f1_status.addEventListener('click', () => {
    f1_status.innerText = '';
    f1_cbalance.innerText = f1_nbalance.innerText;
})

const f2_form = document.querySelector('.f2.query-form');
const f2_table = document.querySelector('.f2.table-trans');
const f2_check = document.querySelector('.form-check-input');
const f2_spin = document.querySelector('.f2.spin');
const f2_key2 = document.querySelector('.f2.key2');

const hashArr = [];

f2_form.elements.timestamp.value = Math.round(new Date().getTime() / 1000) - 86400;

f2_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const address = f2_form.elements.address.value;
    const key = f2_form.elements.key.value;
    f2_spin.classList.toggle('d-none')
    const res = checkNewTrans(address, key);
})

f2_check.addEventListener('change', () => {
    f2_key2.toggleAttribute('disabled')
})

const checkStatus = async (hash, key, dom) => { 
    try {
        const config = {params: {module: 'transaction', action: 'gettxreceiptstatus', txhash: hash, apikey: key}};
        const res = await axios.get('https://api.bscscan.com/api', config)
        if(res.data.result.status) {
            beep();
            dom.innerHTML = `<svg viewBox="0 0 100 23" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="10" r="10" fill="green" /></svg>`;
        } else {
                dom.innerHTML = `<svg viewBox="0 0 100 23" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="10" r="10" fill="red" /></svg>`;

                const delayCheckStatus = (hash, key, dom) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            checkStatus(hash, key, dom);
                        }, 500)
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
        console.log(transArr);
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
                if(f2_check.checked) {
                    if(f2_form.elements.key2.value) {
                        const statusCode = checkStatus(tran.hash, f2_form.elements.key2.value, tdStatus)
                    } else {
                        const statusCode = checkStatus(tran.hash, key, tdStatus)
                    }
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

const f3_form = document.querySelector('.f3.query-form');
const f3_spin = document.querySelector('.f3.spin');
const f3_table = document.querySelector('.f3.table-trans');

let f3_tbalance = 0;

f3_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const address = f3_form.elements.address.value.replace(/\s/g, '');
    const key = f3_form.elements.key.value;
    f3_spin.classList.toggle('d-none');
    const res = await checkMultiAddressBalance(address, key);
})

const checkMultiAddressBalance = async (address, key) => {
    try {
        const config = {params: {module: 'account', action: 'balancemulti', address: address, tax: 'lastest', apikey: key}};
        const res = await axios.get('https://api.bscscan.com/api', config);
        const dataArr = res.data.result;
        
        if(f3_table.children.length === 0) {
            dataArr.forEach(data => {
                const newTr = document.createElement('tr');
                const trClass = data.account.substring(1);
                const result = (parseInt(data.balance)/1000000000000000000).toFixed(18);
                f3_tbalance = result;
                newTr.classList.add(trClass);
                f3_table.append(newTr);
                const tdAddress = document.createElement('td');
                tdAddress.classList.add('tdAddress')
                tdAddress.innerHTML = `<a href='https://bscscan.com/address/${data.account}' target='_blank'>${data.account}</a>`;
                newTr.append(tdAddress);
                const tdCurrent = document.createElement('td');
                tdCurrent.classList.add('tdCurrent')
                tdCurrent.append(result);
                newTr.append(tdCurrent);
                const tdNew = document.createElement('td');
                tdNew.classList.add('tdNew');
                tdNew.append(result);
                newTr.append(tdNew);
                const tdStatus = document.createElement('td');
                tdStatus.classList.add('tdStatus');
                newTr.append(tdStatus);
            });
        } else {
            dataArr.forEach(data => {
                const trClass = data.account.substring(1);
                const tdAddress = document.querySelector(`.${trClass}`);
                const tdCurrent = document.querySelector(`.${trClass} .tdCurrent`);
                const tdNew = document.querySelector(`.${trClass} .tdNew`);
                const tdStatus = document.querySelector(`.${trClass} .tdStatus`);
                const result = (parseInt(data.balance)/1000000000000000000).toFixed(18);

                f3_tbalance = result;
                if(tdNew.innerText !== f3_tbalance) {
                    beep();
                    tdNew.innerText = result;
                    tdStatus.innerHTML = `<svg viewBox="0 0 100 23" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="10" r="10" fill="#FFBF00" /></svg>`;

                    tdStatus.addEventListener('click', () => {
                        tdStatus.innerHTML = '';
                        tdCurrent.innerText = tdNew.innerText;
                    })
                }                
            });
        }
        
        const delayCheckMulti = (address, key) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    checkMultiAddressBalance(address, key);
                }, 500)
            })
        }
        let nextTrans = await delayCheckMulti(address, key);

    } catch(e) {
        console.log('ERROR!!!', e)
    }
}