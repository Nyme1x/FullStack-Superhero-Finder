import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './DemoLists.css';

function DemoLists() {
  const [publicLists, setPublicLists] = useState([]);
  const [expandedListId, setExpandedListId] = useState(null);
  const [expandedHeroId, setExpandedHeroId] = useState({});
  const [listReviews, setListReviews] = useState({});
  const history = useHistory();
  const [username, setUsername] = useState(localStorage.getItem('name'));

  useEffect(() => {
    fetchPublicLists();
  }, []);

  const fetchPublicLists = async () => {
    try {
      const response = await fetch('/lists/Find/public');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const lists = await response.json();
      const updatedLists = lists.map(list => ({
        ...list,
        lastModified: new Date().toLocaleDateString()
      }));
      setPublicLists(updatedLists);
    } catch (error) {
      console.error('Error fetching public lists:', error);
    }
  };

  const fetchHeroDetails = async (heroId) => {
    try {
      const response = await fetch(`/superheroes/${encodeURIComponent(heroId)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const heroDetails = await response.json();
      return heroDetails;
    } catch (error) {
      console.error('Could not fetch hero details:', error);
      return null;
    }
  };

  const fetchListReviews = async (listName) => {
    try {
      const response = await fetch(`/lists/lists/${encodeURIComponent(listName)}/reviews`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const reviews = await response.json();
      return reviews;
    } catch (error) {
      console.error('Could not fetch list reviews:', error);
      return [];
    }
  };

  const toggleListDetails = async (listId) => {
    setExpandedListId(prevId => (prevId === listId ? null : listId));
    if (expandedListId !== listId) {
      const list = publicLists.find(l => l._id === listId);
      if (list && list.name) {
        const heroesDetails = await Promise.all(list.superheroIds.map(fetchHeroDetails));
        const reviews = await fetchListReviews(list.name);
        setPublicLists(prevLists => prevLists.map(l =>
          l._id === listId ? { ...l, heroes: heroesDetails } : l
        ));
        setListReviews(prevReviews => ({ ...prevReviews, [listId]: reviews }));
      }
    }
  };

  const toggleHeroDetails = (listId, heroId) => {
    setExpandedHeroId(prevIds => ({
      ...prevIds,
      [listId]: prevIds[listId] === heroId ? null : heroId
    }));
  };

  const goToMainPage = () => {
    history.push('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const searchOnDDG = (heroName) => {
    const query = encodeURIComponent(heroName);
    const url = `https://duckduckgo.com/?q=${query}`;
    window.open(url, '_blank');
  };

  return (
    <div className="demo-lists-container">
      <h2>Welcome, {username}!</h2>
      <h1>Public Hero Lists</h1>
      {publicLists.map(list => (
        <div key={list._id} className="public-list-item">
          <h3>{list.name}</h3>
          <p>Creator: {list.username}</p>
          <p>Number of Heroes: {list.superheroIds?.length || 0}</p>
          <p>Description: {list.description}</p>
          <p>Last Modified: {formatDate(list.lastModified)}</p>
          <button onClick={() => toggleListDetails(list._id)} className="toggle-details-button">
            {expandedListId === list._id ? 'Hide Details' : 'Show Details'}
          </button>
          {expandedListId === list._id && (
            <div className="list-details">
              {list.heroes?.map(hero => (
                <div key={hero._id} className="hero-detail">
                  <button onClick={() => toggleHeroDetails(list._id, hero._id)} className="toggle-hero-button">
                    {expandedHeroId[list._id] === hero._id ? 'Hide Hero' : hero.name}
                  </button>
                  {expandedHeroId[list._id] === hero._id && (
                    <div className="hero-info">
                      <p>Power: {hero.powers.join(', ')}</p>
                      <p>Publisher: {hero.publisher}</p>
                      <p>Race: {hero.race}</p>
                      <p>Gender: {hero.gender}</p>
                      <p>Eye Color: {hero.eyeColor}</p>
                      <p>Hair Color: {hero.hairColor}</p>
                      <p>Height: {hero.height}</p>
                      <p>Skin Color: {hero.skinColor}</p>
                      <p>Alignment: {hero.alignment}</p>
                      <p>Weight: {hero.weight}</p>
                      <button onClick={() => searchOnDDG(hero.name)} className="search-ddg-button">
                        Search on DDG
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {listReviews[list._id] && (
                <div className="list-reviews">
                  {listReviews[list._id].filter(review => !review.hidden).map(review => ( // Filtering out hidden reviews
                    <div key={review._id} className="review-detail">
                      <p>Reviewer: {review.reviewerName}</p>
                      <p>Comment: {review.comment}</p>
                      <p>Rating: {review.rating}</p>
                      <p>Date: {formatDate(review.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={goToMainPage} className="main-page-button">Main Page</button>
    </div>
  );
}  

export default DemoLists;
