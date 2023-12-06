import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const response = await fetch('api/users/signIn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        // Assuming 'deactivated' is a flag in your response when a user is deactivated
         if (data.status === "SUCCESS") {
            console.log('Logged in:', data);
            // Check if the logged-in user is an admin and navigate accordingly
            if (data.isDeactivated) {
              setError("User is Deactivated. Contact admin for help.");
            }else if(data.isAdmin) {
                history.push('/adminDashboard');
            } else {
                history.push('/verifiedMainPage');
            }
        } else {
            setError(data.message);
        }
    } catch (err) {
        setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="login-background">
      <div className="buttons-container">
        <Link to="/" className="button-link"><button className="button">HomePage</button></Link>
        <button className="button" onClick={() => history.push('/updatePassword')}>Update Password</button>
      </div>
      <div className="login-container">
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="button">Login</button>
          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
