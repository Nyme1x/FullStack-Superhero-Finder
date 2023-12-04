import React from 'react';
import { Link } from 'react-router-dom';


function Policies() {
  return (
    <div>
      <div>
        <h1>Security and Privacy Policy</h1>
        <h2>Introduction</h2>
        <p>Welcome to Superhero Search App. Your privacy and security are of utmost importance to us. This Security and Privacy Policy outlines our practices regarding the collection, use, and protection of your personal information.</p>

        <h2>Information Collection</h2>
        <p>We collect information to provide better services to our users. This includes:</p>
        <ul>
          <li>Information you provide when creating an account, such as your name and email address.</li>
          <li>Information collected through use of our services, such as search queries and preferences.</li>
        </ul>

        <h2>Use of Information</h2>
        <p>The information we collect is used to:</p>
        <ul>
          <li>Provide, maintain, and improve our services.</li>
          <li>Develop new services and features.</li>
          <li>Protect Superhero Search App and our users.</li>
        </ul>
      </div>

      <div>
        <h1>Acceptable Use Policy (AUP)</h1>
        <h2>Introduction</h2>
        <p>This Acceptable Use Policy outlines the rules and guidelines for using our website, Superhero Search App.</p>

        <h2>Prohibited Conduct</h2>
        <p>Users of Superhero Search App must not:</p>
        <ul>
          <li>Engage in illegal activities or promote harmful behaviors.</li>
          <li>Post or distribute malicious content.</li>
          <li>Violate intellectual property rights of others.</li>
        </ul>
      </div>

      <div>
        <h1>DMCA Notice & Takedown Policy</h1>
        <h2>Introduction</h2>
        <p>Superhero Search App respects the intellectual property rights of others and expects its users to do the same.</p>

        <h2>DMCA Notice Procedure</h2>
        <p>Copyright owners who believe their material has been infringed on our platform can submit a notice of infringement with the following information:</p>
        <ul>
          <li>A physical or electronic signature of the copyright owner or their agent.</li>
          <li>Identification of the infringing material and information reasonably sufficient to permit Superhero Search App to locate the material.</li>
        </ul>
        <div className="buttons-container">
        <Link to="/" className="button-link">
          <button className="button">Home Page</button>
        </Link>
      </div>
      </div>
    </div>
  );
}

export default Policies;
