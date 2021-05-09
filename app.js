let address;
let getBalanceApi;

const startBtn = document.querySelector('.start-btn');
const stopBtn = document.querySelector('.stop-btn');
const resetBtn = document.querySelector('.reset-btn');

const progress = document.querySelector('.progress');
const cbalance = document.querySelector('.cbalance');
const nbalance = document.querySelector('.nbalance');
const status = document.querySelector('.status');

let stopFlg = false;

startBtn.addEventListener('click', () => {
    address = document.querySelector('#address').value;
    getBalanceApi = `https://api.bscscan.com/api?module=account&action=balance&address=${address}&tag=latest&apikey=9YQVTIFTB7T2A7NK2XU5YAIHQEAEVS1C3D`
    console.log(address);
    stopFlg = false;
    checkAddressBalance();
}) 

stopBtn.addEventListener('click', () => {
    stopFlg = true;
})

resetBtn.addEventListener('click', () => {
    cbalance.innerText = null;
    nbalance.innerText = null;
    status.innerText = null;
    while( progress.firstChild ){
        progress.removeChild( progress.firstChild );
    }
})

const checkAddressBalance = () => {
    fetch(getBalanceApi)
        .then(res => {
            return res.json()
        }).then(res => {
            if(!cbalance.innerText) {
                cbalance.innerText = res.result
                nbalance.innerText = res.result
            }
            nbalance.innerText = res.result
            if(cbalance.innerText !== nbalance.innerText) {
                status.innerText = 'change!!!'
                nbalance.innerText = res.result
            }
            const data = document.createElement('li');
            data.innerText = res.result;
            progress.appendChild(data);
        }).catch(err => {
        console.log("ERROR!!!", err)
        })
    if(!stopFlg) {
        setTimeout(checkAddressBalance, 250)
    }
}


