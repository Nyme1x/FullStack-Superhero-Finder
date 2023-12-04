import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './updatePassword.css'; // Assuming you will create this CSS file

function UpdatePassword() {
  const [email, setEmail] = useState(''); // Add email state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    // Add validation for new passwords matching, etc.

    try {
      const response = await fetch('/users/updatePassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, oldPassword, newPassword }), // Include email
      });

      const data = await response.json();
      
      if (data.status === "SUCCESS") {
        console.log('Password updated:', data);
        history.push('/login'); // Redirect to login after update
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="update-password-container">
      <form onSubmit={handleUpdatePassword}>
        <h2>Update Password</h2>
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
          <label htmlFor="old-password">Old Password:</label>
          <input 
            type="password" 
            id="old-password" 
            value={oldPassword} 
            onChange={(e) => setOldPassword(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New Password:</label>
          <input 
            type="password" 
            id="new-password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-new-password">Confirm New Password:</label>
          <input 
            type="password" 
            id="confirm-new-password" 
            value={confirmNewPassword} 
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="button">Update Password</button>
  
        {/* Link to navigate to the login page */}
        <Link to="/login" className="login-link">Back to Login</Link>
      </form>
    </div>
  );
  
}

export default UpdatePassword;
