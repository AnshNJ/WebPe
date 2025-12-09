import React, { useState, useEffect } from 'react';

// This should be in your .env file
const PSP_SERVER_API = 'http://localhost:5000/api/v1/payments';

function Payment() {
  const [paymentStatus, setPaymentStatus] = useState('IDLE'); // IDLE, PENDING, SUCCESS, FAILED
  const [transactionId, setTransactionId] = useState(null);

  // This effect will run when transactionId is set, starting the polling.
  useEffect(() => {
    let interval: any;
    if (transactionId && paymentStatus === 'PENDING') {
      interval = setInterval(async () => {
        console.log('Polling for status...');
        try {
          const response = await fetch(`${PSP_SERVER_API}/status/${transactionId}`);
          const data = await response.json();

          if (data.status !== 'PENDING') {
            setPaymentStatus(data.status);
            setTransactionId(null); // Stop polling
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Polling error:', error);
          // Optional: Implement max retries for polling
        }
      }, 2000); // Poll every 2 seconds
    }

    // Cleanup function to clear the interval when the component unmounts or dependencies change
    return () => clearInterval(interval);
  }, [transactionId, paymentStatus]);


  const handlePay = async () => {
    setPaymentStatus('INITIATING');
    
    // Generate a unique ID on the client for idempotency
    const clientRequestId = `client-${Date.now()}`;

    try {
      const response = await fetch(`${PSP_SERVER_API}/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100.00, // Example amount
          client_request_id: clientRequestId,
        }),
      });

      const data = await response.json();

      if (response.status === 202) { // 202 Accepted
        setPaymentStatus('PENDING');
        setTransactionId(data.transaction_id);
      } else {
        // Handle cases where the transaction was already processed (idempotency)
        setPaymentStatus(data.status);
      }

    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('FAILED');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>WebPe</h1>
        <button onClick={handlePay} disabled={paymentStatus === 'PENDING' || paymentStatus === 'INITIATING'}>
          {paymentStatus === 'PENDING' ? 'Processing...' : 'Pay ₹100'}
        </button>
        <p>Status: <strong>{paymentStatus}</strong></p>
      </header>
    </div>
  );
}

export default Payment;
