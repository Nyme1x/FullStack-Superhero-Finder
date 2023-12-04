// MainPage.js

import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './MainPage.css';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

function MainPage() {
  const [superheroes, setSuperheroes] = useState([]);
  const [query, setQuery] = useState('');
  const [raceQuery, setRaceQuery] = useState('');
  const [powerQuery, setPowerQuery] = useState('');
  const [publisherQuery, setPublisherQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [searchType, setSearchType] = useState('name');
  const [n, setN] = useState('');

  const history = useHistory();

  useEffect(() => {
    fetchSuperheroes();
  }, []);

  function fetchSuperheroes() {
    fetch("/superheroes/api/search")
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        setSuperheroes(data);
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }
function searchSuperheroes(event) {
  event.preventDefault();
  let searchUrl = `/superheroes/api/search?field=${encodeURIComponent(searchType)}&pattern=${encodeURIComponent(query)}`;
  if (n > 0) {
    searchUrl += `&n=${encodeURIComponent(n)}`;
  }

  if (raceQuery) {
    searchUrl += `&race=${encodeURIComponent(raceQuery)}`;
  }
  if (powerQuery) {
    searchUrl += `&power=${encodeURIComponent(powerQuery)}`;
  }
  if (publisherQuery) {
    searchUrl += `&publisher=${encodeURIComponent(publisherQuery)}`;
  }

  fetch(searchUrl)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      setSuperheroes(data);
    })
    .catch(error => {
      console.error('Error fetching superheroes:', error);
    });
}


  const toggleDetails = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setRaceQuery('');
    setPowerQuery('');
    setPublisherQuery('');
    setSuperheroes([]); // Clears the displayed results
  };

  const goToDemoLists = () => {
    history.push('/DemoLists');
  };

  return (
    <div className="app-container">
      <div className="top-navigation">
        <div className="full-experience-container">
          <span className="full-experience-text">View The Full Experience!</span>
        </div>
        <div className="auth-buttons">
          <button className="nav-button">
            <Link to="/login">Sign In</Link>
          </button>
          <button className="nav-button">
            <Link to="/signup">Sign Up</Link>
          </button>
          <button className="nav-button" onClick={goToDemoLists}>
            View Lists
          </button>
        </div>
      </div>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Superhero"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Search by Race"
          value={raceQuery}
          onChange={e => setRaceQuery(e.target.value)}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Search by Power"
          value={powerQuery}
          onChange={e => setPowerQuery(e.target.value)}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Search by Publisher"
          value={publisherQuery}
          onChange={e => setPublisherQuery(e.target.value)}
        />
        <button
          className="search-button"
          onClick={searchSuperheroes}
        >
          Search
        </button>
        <button
          className="clear-button"
          onClick={clearSearch}
        >
          Clear
        </button>
      </div>
      <ul className="superhero-list">
        {superheroes.length > 0 ? superheroes.map(superhero => (
          <li key={superhero._id} className="superhero-item">
            <div className="superhero-header" onClick={() => toggleDetails(superhero._id)}>
              <h2>{superhero.name}</h2>
              <p>Publisher: {superhero.publisher}</p>
              <button className="dropdown-button">
                {expandedId === superhero._id ? <FaCaretUp /> : <FaCaretDown />}
              </button>
            </div>
            {expandedId === superhero._id && (
              <div className="superhero-details">
                <p>Race: {superhero.race || 'Unknown'}</p>
                <p>Power: {superhero.powers.join(', ') || 'None'}</p>
                <p>Race: {superhero.race || 'Unknown'}</p>
                <p>Gender: {superhero.gender || 'Unknown'}</p>
                <p>Eye Color: {superhero.eyeColor|| 'None'}</p>
                <p>Hair Color: {superhero.hairColor || 'Unknown'}</p>
                <p>Height: {superhero.height|| 'None'}</p>
                <p>Skin Color: {superhero.skinColor || 'None'}</p>
                <p>Alignment: {superhero.allignment|| 'None'}</p>
                <p>weight: {superhero.weight|| 'None'}</p>



      
              </div>
            )}
          </li>
        )) : (
          <p>No results found</p>
        )}
      </ul>
      <div className="footer">
        <p></p>
      </div>
    </div>
  );
}

export default MainPage;
