// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Make sure this points to your actual CSS file

function Home() {
    return (
      <div className="home-container">
        <h1 className="home-title">Superhero Search App</h1>
        <div className="welcome-message">
          <p>Welcome to Your Ultimate Digital Playground!</p>
          <p>Get ready to dive into a world where your creativity takes center stage. Our platform is not just a website; it's a universe of possibilities:</p>
          <ul>
            <p>Be the Hero of Your Journey: Create your account and step into a realm where your choices shape your experience. Your adventure begins at login!</p>
            <p>Master List Maker: Unleash your inner organizer with our list-making feature.</p>
            <p>Connect and Conquer: Join a community of explorers and express yourself.</p>
            <p>Your Space, Your Rules: Enjoy the freedom to customize your experience.</p>
            <p>A Universe of Content at Your Fingertips: Dive into our extensive collection.</p>
          </ul>
          <p>Prepare to embark on an epic journey of discovery and fun. Your digital adventure awaits! 🚀✨</p>
        </div>
        
        <div className="buttons-container">
          <Link to="/signup" className="button-link"><button className="button">Sign Up</button></Link>
          <Link to="/login" className="button-link"><button className="button">Login</button></Link>
          <Link to="/MainPage" className="button-link"><button className="button">Don't Have an Account, Demo!</button></Link>
          <Link to="/privacy" className="button-link"><button className="button">Privacy</button></Link>

        </div>
      </div>
    );
  }
  
  export default Home;