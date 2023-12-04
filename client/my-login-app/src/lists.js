import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './lists.css';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

function ListsPage() {
  const [lists, setLists] = useState([]);
  const [publicLists, setPublicLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListVisibility, setNewListVisibility] = useState('private');
  const [selectedListName, setSelectedListName] = useState(null);
  const [heroesInSelectedList, setHeroesInSelectedList] = useState([]);
  const [heroIdToAdd, setHeroIdToAdd] = useState('');
  const [expandedHeroId, setExpandedHeroId] = useState({});
  const [username, setUsername] = useState(localStorage.getItem('name'));
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchLists();
    fetchPublicLists();
  }, []);

  function fetchLists() {
    const url = `/lists/lists?username=${encodeURIComponent(username)}`;
    fetch(url)
      .then(response => response.json())
      .then(data => setLists(data))
      .catch(error => console.error('Error fetching lists:', error));
  }

  function fetchPublicLists() {
    const url = `/lists/Find/public`;
    fetch(url)
      .then(response => response.json())
      .then(data => setPublicLists(data))
      .catch(error => console.error('Error fetching public lists:', error));
  }

  const createNewList = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/lists/lists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription,
          visibility: newListVisibility,
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setNewListName('');
      setNewListDescription('');
      setNewListVisibility('private');
      fetchLists();
    } catch (error) {
      console.error('Error creating new list:', error);
    }
  };

  function viewListDetails(listName) {
    if (selectedListName === listName) {
      setSelectedListName(null);
      setHeroesInSelectedList([]);
    } else {
      setSelectedListName(listName);
      fetch(`/lists/${encodeURIComponent(listName)}/superheroes/info`)
        .then(response => response.json())
        .then(data => setHeroesInSelectedList(data))
        .catch(error => console.error('Error fetching heroes for list:', error));
    }
  }

  function deleteList(listName) {
    fetch(`/lists/${encodeURIComponent(listName)}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error deleting list');
      }
      return response.text();
    })
    .then(() => {
      setLists(lists.filter(list => list.name !== listName));
      if (selectedListName === listName) {
        setSelectedListName(null);
        setHeroesInSelectedList([]);
      }
    })
    .catch(error => console.error('Error deleting list:', error));
  }

  function addHeroToList() {
    fetch(`/lists/add/${encodeURIComponent(selectedListName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ superheroIds: [heroIdToAdd] })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error adding hero to list');
      }
      return response.json();
    })
    .then(() => {
      setHeroIdToAdd('');
      viewListDetails(selectedListName);
    })
    .catch(error => console.error('Error adding hero to list:', error));
  }

 function removeHeroFromList(superheroId) {
  console.log(superheroId);
  fetch(`/lists/remove/${encodeURIComponent(selectedListName)}/${encodeURIComponent(superheroId)}`, {
    method: 'DELETE'
    
  })
  
  .then(response => {
    if (!response.ok) {
      throw new Error('Error removing hero from list');
    }
    return response.text();
  })
  .then(() => {
    setHeroesInSelectedList(prevHeroes => prevHeroes.filter(hero => hero.id !== superheroId));
  })
  .catch(error => console.error('Error removing hero from list:', error));
}




  const addReview = async (listName, e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/lists/lists/${encodeURIComponent(listName)}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerName,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setReviewerName('');
      setRating(1);
      setComment('');
      fetchPublicLists(); // Refresh public lists to show new review
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const toggleHeroDetails = (listName, heroId) => {
    setExpandedHeroId(prev => ({
      ...prev,
      [listName]: prev[listName] === heroId ? null : heroId
    }));
  };

  return (
    <div className="lists-page-container">
      <h1>Hero Lists</h1>
      <div className="username-display">
        <h2>Welcome, {username}!</h2>
      </div>
  
      <div className="create-list-form">
        <input
          type="text"
          placeholder="List Name"
          value={newListName}
          onChange={e => setNewListName(e.target.value)}
        />
        <textarea
          placeholder="List Description"
          value={newListDescription}
          onChange={e => setNewListDescription(e.target.value)}
        />
        <select
          value={newListVisibility}
          onChange={e => setNewListVisibility(e.target.value)}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
        <button onClick={createNewList}>Create List</button>
      </div>
  
      {lists.map(list => (
        <div key={list._id} className="list-item">
          <h3>{list.name}</h3>
          <p>Description: {list.description}</p>
          <p>Visibility: {list.visibility}</p>
          <button onClick={() => viewListDetails(list.name)}>View Details</button>
          {selectedListName === list.name && (
            <div>
              <h4>Heroes in this list:</h4>
              {heroesInSelectedList.map(hero => (
                <div key={hero.id} className="hero-details-container">
                  <span className="hero-name">{hero.name}</span>
                  <button onClick={() => removeHeroFromList(hero.id)}>Remove Hero from List</button>
                  <button onClick={() => toggleHeroDetails(list.name, hero._id)} className="dropdown-button">
                    {expandedHeroId[list.name] === hero._id ? <FaCaretUp /> : <FaCaretDown />}
                  </button>
                  {expandedHeroId[list.name] === hero._id && (
                    <div className="hero-details">
                      <p>Race: {hero.race || 'Unknown'}</p>
                      <p>Power: {hero.powers.join(', ') || 'None'}</p>
                      <p>Gender: {hero.gender || 'Unknown'}</p>
                      <p>Eye Color: {hero.eyeColor || 'None'}</p>
                      <p>Hair Color: {hero.hairColor || 'Unknown'}</p>
                      <p>Height: {hero.height || 'None'}</p>
                      <p>Skin Color: {hero.skinColor || 'None'}</p>
                      <p>Alignment: {hero.alignment || 'None'}</p>
                      <p>Weight: {hero.weight || 'None'}</p>
                    </div>
                  )}
                </div>
              ))}
              <input
                type="text"
                placeholder="Enter Hero ID to add"
                value={heroIdToAdd}
                onChange={e => setHeroIdToAdd(e.target.value)}
              />
              <button onClick={addHeroToList}>Add Hero to List</button>
            </div>
          )}
          <button onClick={() => deleteList(list.name)}>Delete List</button>
        </div>
      ))}
  
      <h2>Public Lists</h2>
      {publicLists.map(list => (
        <div key={list._id} className="list-item">
          <h3>{list.name}</h3>
          <p>Description: {list.description}</p>
          <h4>Reviews:</h4>
          <div className="reviews-container">
            {list.reviews.filter(review => !review.hidden).map((review, index) => (
              <div key={index} className="review-box">
                <strong>{review.reviewerName}</strong> Rating: {review.rating}
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
  
          <form onSubmit={(e) => addReview(list.name, e)}>
            <input
              type="text"
              placeholder="Reviewer Name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              min="1"
              max="5"
              required
            />
            <textarea
              placeholder="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Add Review</button>
          </form>
        </div>
      ))}
  
      <button onClick={() => history.push('/')}>Back to Main</button>
    </div>
  );
  
}

export default ListsPage;
