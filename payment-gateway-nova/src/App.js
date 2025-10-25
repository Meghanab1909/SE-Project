import React, { useState } from 'react';
import axios from 'axios';
import './App.css';


function App() {
const [upiId, setUpiId] = useState('');
const [amount, setAmount] = useState('');
const [message, setMessage] = useState('');


const handlePay = async () => {
if (!upiId || !amount) {
setMessage('Please enter UPI ID and amount');
return;
}
try {
const res = await axios.post('http://localhost:3001/pay', { upiId, amount: Number(amount) });
setMessage(`Payment Successful!`);
setUpiId('');
setAmount('');
} catch (err) {
setMessage(err.response?.data?.error || 'Payment failed');
}
};


return (
<div className="App">
<div className="payment-container">
<h2>✨ <br/> NOVA</h2>
<input type="text" placeholder="Enter UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} />
<input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
<button onClick={handlePay}>Pay Now</button>
{message && <p className={`message ${message.includes('Successful') ? 'success' : 'error'}`}>
  {message}
</p>}
</div>
</div>
);
}


export default App;