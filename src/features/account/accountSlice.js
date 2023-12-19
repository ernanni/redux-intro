const initialStateAccount = {
  balance: 0,
  loan: 0,
  loanPurpose: '',
  isLoading: false,
};

export default function accountReducer(state = initialStateAccount, action) {
  switch (action.type) {
    case 'account/deposit':
      return {
        ...state,
        balance: state.balance + action.payload,
        isLoading: false,
      };
    case 'account/withdraw':
      return { ...state, balance: state.balance - action.payload };
    case 'account/requestLoan':
      const { amount, purpose } = action.payload;
      if (state.loan > 0) return state;
      else
        return {
          ...state,
          loan: amount,
          loanPurpose: purpose,
          balance: state.balance + amount,
        };
    case 'account/payLoan':
      return {
        ...state,
        loan: 0,
        loanPurpose: '',
        balance: state.balance - state.loan,
      };
    case 'account/convertingCurrency':
      return {
        ...state,
        isLoading: true,
      };
    default:
      return state;
  }
}

function deposit(amount, currency) {
  if (currency === 'USD') return { type: 'account/deposit', payload: amount };

  //Redux Thunk is used when we make an external request in order to proceed with state change asynchronously
  return async (dispatch, getState) => {
    dispatch({ type: 'account/convertingCurrency' });
    //API call -- middleware
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    const converted = data.rates.USD;

    dispatch({ type: 'account/deposit', payload: converted });
  };
}

function withdraw(amount) {
  return { type: 'account/withdraw', payload: amount };
}

function requestLoan(amount, purpose) {
  return {
    type: 'account/requestLoan',
    payload: { amount, purpose },
  };
}

function payLoan() {
  return { type: 'account/payLoan' };
}

export { deposit, withdraw, requestLoan, payLoan };
