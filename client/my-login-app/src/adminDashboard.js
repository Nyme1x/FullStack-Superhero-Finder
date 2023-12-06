import React, { useEffect, useState } from 'react';
import './adminDashboard.css';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [lists, setLists] = useState([]);
  const [actionMessage, setActionMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchNonAdminUsers();
    fetchLists();
  }, []);

  async function fetchNonAdminUsers() {
    try {
      const response = await fetch('api/users/users');
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching non-admin users:', error);
    }
  }

  async function fetchLists() {
    try {
      const response = await fetch('api/lists');
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  }

  const handleGrantAdmin = async (username) => {
    const adminUsername = localStorage.getItem('name');
    console.log(adminUsername);
    try {
      const response = await fetch(`api/users/grant-admin/${username}?adminUsername=${adminUsername}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        alert('Admin privileges granted successfully');
        fetchNonAdminUsers(); // Refresh the user list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error granting admin privileges:', error);
      alert('Error occurred while granting admin privileges');
    }
  };

  const toggleUserActivation = async (username) => {
    const adminUsername = localStorage.getItem('name');
    console.log(adminUsername);
    try {
      const response = await fetch(`api/users/deactivate-user/${username}?adminUsername=${adminUsername}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setActionMessage(data.message);
        fetchNonAdminUsers(); // Refresh the user list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error toggling user activation:', error);
      alert('Error occurred while toggling user activation');
    }
  };

  const hideReview = async (listName, reviewId) => {
    const adminUsername = localStorage.getItem('name');
    try {
      const endpoint = `api/lists/lists/${listName}/reviews/hide/${reviewId}?adminUsername=${adminUsername}`;
      const response = await fetch(endpoint, { method: 'PUT' });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setActionMessage('Review hidden successfully');
        fetchLists(); // Refresh the lists to reflect the changes
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error hiding review:', error);
      setActionMessage(`Error: ${error.message}`);
    }
  };
  
  const unhideReview = async (listName, reviewId) => {
    const adminUsername = localStorage.getItem('name');
    try {
      const endpoint = `api/lists/lists/${listName}/reviews/unhide/${reviewId}?adminUsername=${adminUsername}`;
      const response = await fetch(endpoint, { method: 'PUT' });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setActionMessage('Review unhidden successfully');
        fetchLists(); // Refresh the lists to reflect the changes
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error unhiding review:', error);
      setActionMessage(`Error: ${error.message}`);
    }
  };

  const goToVerifiedMainPage = () => {
    history.push('/verifiedMainPage'); // Adjust the path as needed for your routing setup
  };
 return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="button" onClick={goToVerifiedMainPage}>User Access</button>
      </div>
      
      <div className="user-list-section">
        <h2>User List</h2>
        <div className="user-list">
          {users.map(user => (
            <div key={user.name} className="user-box">
              <h3>{user.name}</h3>
              <div className="user-detail">
                <p>Email: {user.email}</p>
                <p>Admin: {user.isAdmin ? 'Yes' : 'No'}</p>
                <p>Deactivated: {user.isDeactivated ? 'Yes' : 'No'}</p>
                <p>Hidden: {user.hidden ? 'Yes' : 'No'}</p>
              </div>
              <button className="button" onClick={() => handleGrantAdmin(user.name)}>Grant Admin</button>
              <button className="button" onClick={() => toggleUserActivation(user.name)}>
                {user.isDeactivated ? 'Reactivate' : 'Deactivate'} User
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="review-list-section">
        <h2>List of Reviews</h2>
        <div className="list-container">
          {lists.map(list => (
            <div key={list.name} className="list-box">
              <h3>{list.name}</h3>
              {list.reviews && list.reviews.map(review => (
                <div key={review._id} className="review-box">
                  <p>Reviewer: {review.reviewerName}</p>
                  <p>Comment: {review.comment}</p>
                  <p>Rating: {review.rating}</p>
                  <button onClick={() => review.hidden ? unhideReview(list.name, review._id) : hideReview(list.name, review._id)}>
                    {review.hidden ? 'Unhide' : 'Hide'} Review
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {actionMessage && <div className="message">{actionMessage}</div>}
    </div>
  );
}

export default AdminDashboard;
