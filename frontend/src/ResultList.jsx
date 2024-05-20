import "./resultlist.css";
function ResultList({ results }) {
  return (
    <ul className="result-list">
      {results.map((result, index) => (
        <li key={index} className="result-item">
          <h3>{result.domain}</h3>
          {result.error ? (
            <div className="error">Error: {result.error}</div>
          ) : (
            <div className="data">
              {result.data.followers_count !== undefined && (
                <div>
                  <span>Followers Count:</span> {result.data.followers_count}
                </div>
              )}
              {result.data.followings_count !== undefined && (
                <div>
                  <span>Following Count:</span> {result.data.followings_count}
                </div>
              )}
              {result.data.bio !== undefined && (
                <div>
                  <span>Bio:</span> {result.data.bio}
                </div>
              )}
              {result.data.employeeCountText !== undefined && (
                <div>
                  <span>Company Employees:</span>{" "}
                  {result.data.employeeCountText}
                </div>
              )}
              {result.data.associatedEmployees !== undefined && (
                <div>
                  <span>Associated Employees:</span>{" "}
                  {result.data.associatedEmployees}
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default ResultList;
