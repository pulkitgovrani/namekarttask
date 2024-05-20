import { useState } from 'react';
import axios from 'axios';
import './App.css';
import ResultList from './ResultList';

function App() {
  const [domains, setDomains] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (event) => {
    setDomains(event.target.value);
  };

  const handleCheckDomains = async () => {
    const domainList = domains
    .split('\n')
    .map(domain => domain.trim().toLowerCase().replace('.com', ''))
    .filter(domain => domain !== '');
    console.log(domainList);
    const resultPromises = domainList.map(domain => checkDomain(domain));
    
    try {
      const results = await Promise.all(resultPromises);
      setResults(results);
    } catch (error) {
      console.error('Error checking domains', error);
    }
  };

  const checkDomain = async (domain) => {
    try {
      let username=domain;
      const response = await axios.post('http://localhost:5000/scrape', { username })
      console.log(response);
      return { domain, data: response.data };
    } catch (error) {
      return { domain, error: error.message };
    }
  };

/*
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/scrape', { username, companyName });
      console.log(response.data);
      setData(response.data);
      setError('');
    } catch (err) {
      console.error('Axios error:', err);
      setError('An error occurred while fetching data.');
      setData(null);
    }
  };
*/
  return (
    <div className="App">
      
      {/*
      <header className="App-header">
        <h1>Instagram and LinkedIn Scraper</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter Instagram username"
          />
          <input
            type="text"
            value={companyName}
            onChange={handleCompanyNameChange}
            placeholder="Enter LinkedIn company name"
          />
          <button type="submit">Scrape</button>
        </form>
        {error && <p>{error}</p>}
        {data && (
          <div>
            <h2>Scraped Data:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <div>
              <h3>Username Picture</h3>
              <img src={data.username_picture_url} alt="Profile" />
              <h3>Bio</h3>
              <p>{data.bio}</p>
              <h3>Bio URL</h3>
              <a href={data.bio_url}>{data.bio_url_display}</a>
              <h3>Total Posts</h3>
              <p>{data.posts_count}</p>
              <h3>Total Followers</h3>
              <p>{data.followers_count}</p>
              <h3>Total Followings</h3>
              <p>{data.followings_count}</p>
              <h3>Recent Posts</h3>
              <ul>
                {data.recent_posts.map((post, index) => (
                  <li key={index}>
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      <img src={post.image} alt={`Post ${index + 1}`} />
                    </a>
                  </li>
                ))}
              </ul>
              <h3>Employees Count (LinkedIn)</h3>
              <p>{data.employees_count}</p>
            </div>
          </div>
        )}
      </header>
        */}
<div className='top-heading'>
Get Both LinkedIn & Instagram Statistics with Domain names as the UserNames
</div>
<div className="container">

      <textarea
        value={domains}
        onChange={handleChange}
        placeholder="Enter domain names, one per line"
        rows="10"
        cols="50"
        className="textarea"
      />
      <br />
      <button onClick={handleCheckDomains} className="button">
        Get Social Statistics Of these Companies
      </button>
      <div className="results">
        <h3>Results:</h3>
        <ul>
          {results.map((result, index) => (
            <li key={index} className="result-item">
              {result.domain}: {result.error ? `Error: ${result.error}` :  <ResultList results={results} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </div>
  );
}

export default App;
