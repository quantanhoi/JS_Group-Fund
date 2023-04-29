'use strict';
const accountArray = [];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnDeposit = document.querySelector('.form__btn--Deposit');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const btnRegister = document.querySelector('.register__btn')
const showRegisterBtn = document.querySelector('.show-register');
const closeRegisterBtn = document.querySelector('.close-register');
const register = document.querySelector('.register');
const overlay = document.querySelector('.overlay');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputDepositAmount = document.querySelector('.form__input--Deposit-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


function openRegister() {
  register.classList.remove("hidden");
  overlay.classList.remove("hidden");
  console.log("modal clicked");
}

function closeRegister() {
  register.classList.add("hidden");
  overlay.classList.add("hidden");
}


btnRegister.addEventListener("click", function(e) {
  e.preventDefault();
  openRegister();
});
closeRegisterBtn.addEventListener("click", function(e) {
  e.preventDefault();
  closeRegister();
});
overlay.addEventListener("click", function (e) {
  e.preventDefault();
  closeRegister();
});

var currentAccount;
class account {
  constructor(owner, username, pin) {
    this.owner = owner;
    this.username = username;
    this.pin = pin;
    this.movements = [];
    this.contactList = [];
  }
  toJSON() {
    return {
      owner: this.owner,
      username: this.username,
      pin: this.pin,
      movements: this.movements,
      contactList: this.contactList,
    }
  }

  addContact(account) {
    this.contactList.push(account);
  }
  
}

async function fetchData() {
  try {
    const response = await fetch("http://localhost:3000/get-json");
    const data = await response.json();
    console.log("Raw JSON data:", data); // Debug: log the raw data

    const accounts = [];

    for (const accountData of data[0]) {
      const accountObj = new account(accountData.owner, accountData.username, accountData.pin);
      accountObj.movements = accountData.movements;
      accountObj.contactList = accountData.contactList;
      accounts.push(accountObj);
    }

    console.log("Parsed account objects:", accounts); // Debug: log the parsed account objects
    return accounts;
  } catch (error) {
    console.error("Error fetching JSON data:", error);
    prompt('Error getting your account data, please try again later');
  }
}



async function saveData(account) {
  try {
    await fetch("http://localhost:3000/save-json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([account]),
    });
    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Error saving JSON data:", error);
  }
}
function checkDuplicateUserName(username, accountArray) {
  return !accountArray.some(account => account.username === username);
}
function addNewAccount(account, accountArray) {
  if (checkDuplicateUserName(account.username, accountArray)) {
    accountArray.push(account);
    saveData(accountArray);
  }
}
function updateMovement(acc, movement) {
  acc.movements.push(...movement);
  saveData(accountArray);
}

// const account_1 = new account('Trung Thieu Quang', 'tqt', 1999);
// const account_2 = new account('Dat Hoang', 'dh', 1999);
// const account_3 = new account('Tran Dang Quang', 'tdq', 1999);
// addNewAccount(account_1, accountArray);
// addNewAccount(account_2, accountArray);
// account_1.addContact(account_2.username);
// account_2.addContact(account_1.username);
// account_2.addContact(account_3.username);
// account_3.addContact(account_1.username);
// addNewAccount(account_3, accountArray);
// saveData(accountArray);


// async function main() {
//   const NewaccountArray = await fetchData();
//   accountArray.push(...NewaccountArray);
//   //test the function with a duplicate account
//   const newAccount = new account('felix', 'fp', 1999);
//   addNewAccount(newAccount, accountArray);
//   console.log(accountArray);
// }
// main();

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

//function
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';
  //sort movement from highest to lowest
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <p class="movements__value">${mov}€</p>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  /*calculate the sum of balance according to movements
  array.prototype.reduce() takes 2 arguments, a callback 
  function and an optional initial value (0)*/
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  //filter out all positive movements and calculate sum
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  //filter out all negative moments then calculate sum
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  //because all positive movements are either from Deposit or transfer
  //therefore get all positive movement, filter out those with deposit keyword (Deposit)
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};
const testMovements = [100, -50, 200, -25];

//log in event 
btnLogin.addEventListener('click', async function(e) {
  e.preventDefault();
  const NewaccountArray = await fetchData();
  accountArray.push(...NewaccountArray);
  currentAccount = accountArray.find(account => account.username === inputLoginUsername.value || account.pin === inputLoginPin.value);
  if(!currentAccount) {
    prompt("Account or password is incorrect, please try again!");
    return;
  }
  labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
  containerApp.style.opacity = 1;
  updateUI(currentAccount);
  

});

function updateUI(acc) {
    // Display movements
    displayMovements(acc.movements);

    // Display balance
    calcDisplayBalance(acc);
  
    // Display summary
    calcDisplaySummary(acc);

}

//create and save new user name, not yet use
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

//transfer money to other
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accountArray.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
    saveData(accountArray);
  }
});

//deposit money
btnDeposit.addEventListener('click', function(e) {
  e.preventDefault();
  const amount = Number(inputDepositAmount.value);
  currentAccount.movements.push(amount);
  inputDepositAmount.value = '';
  updateUI(currentAccount);
  saveData();
});


//close account
btnClose.addEventListener('click', function(e) {
  e.preventDefault();
  if(inputCloseUsername.value === currentAccount.username && inputClosePin.value == currentAccount.pin) {
    
  }
});

//sort function
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

