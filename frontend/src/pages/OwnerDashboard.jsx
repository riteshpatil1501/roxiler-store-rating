import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const OwnerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("userName");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/owner/dashboard");
        setDashboard(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load owner dashboard"
        );
      }
    };

    loadDashboard();
  }, []);

  const sortedRatings = useMemo(() => {
    if (!dashboard?.ratings) return [];

    return [...dashboard.ratings].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === "rating") {
        valueA = Number(valueA);
        valueB = Number(valueB);
      } else {
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [dashboard?.ratings, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  if (error) {
    return (
      <main className="dashboard-container">
        <div className="error-message">{error}</div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <div className="page-header">
        <h1>Store Owner Dashboard</h1>
        <p>{dashboard.store.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Average Rating</span>
          <strong>
            {dashboard.averageRating} <span className="star">⭐</span>
          </strong>
        </div>

        <div className="stat-card">
          <span>Total Ratings</span>
          <strong>{dashboard.totalRatings}</strong>
        </div>
      </div>

      <section className="table-card">
        <div className="section-heading">
          <div>
            <h2>Customers Who Rated Your Store</h2>
          </div>

          {dashboard.ratings.length > 0 && (
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="userName">Sort: Name</option>
                <option value="userEmail">Sort: Email</option>
                <option value="rating">Sort: Rating</option>
              </select>

              <button
                type="button"
                className="secondary-button"
                onClick={toggleSortOrder}
              >
                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
          )}
        </div>

        {sortedRatings.length === 0 ? (
          <div className="empty-state">
            No customers have rated your store yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                </tr>
              </thead>

              <tbody>
                {sortedRatings.map((item) => (
                  <tr key={item.userId}>
                    <td>{item.userName}</td>
                    <td>{item.userEmail}</td>
                    <td>
                      {item.rating} <span className="star">⭐</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default OwnerDashboard;