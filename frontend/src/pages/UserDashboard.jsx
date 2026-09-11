import { useEffect, useState } from "react";
import api from "../services/api";

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [ratingValues, setRatingValues] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStores = async () => {
    try {
      setError("");

      const params = new URLSearchParams();

      if (search) {
        params.append(searchType, search);
      }

      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await api.get(
        `/stores/user?${params.toString()}`
      );

      setStores(response.data.stores);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load stores"
      );
    }
  };

  useEffect(() => {
    loadStores();
  }, [search, searchType, sortBy, sortOrder]);

  const submitRating = async (storeId) => {
    const rating = Number(ratingValues[storeId]);

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }

    try {
      setError("");

      const response = await api.post("/ratings", {
        storeId,
        rating,
      });

      setMessage(response.data.message);

      await loadStores();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit rating"
      );
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Stores</h1>
          <p>Rate and review your favourite stores</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="toolbar">
        <input
          type="text"
          placeholder={`Search by ${searchType}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="address">Address</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="address">Address</option>
          <option value="overallRating">Rating</option>
        </select>

        <button
          className="secondary-button"
          onClick={() =>
            setSortOrder(
              sortOrder === "asc" ? "desc" : "asc"
            )
          }
        >
          {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      <div className="store-grid">
        {stores.map((store) => (
          <div className="store-card" key={store.id}>
            <h2>{store.name}</h2>

            <p>{store.address}</p>

            <div className="rating-row">
              <strong>Overall Rating:</strong>{" "}
              {store.overallRating} ⭐
            </div>

            <div className="rating-row">
              <strong>Your Rating:</strong>{" "}
              {store.userSubmittedRating ?? "Not rated"}
            </div>

            <div className="rating-action">
              <select
                value={ratingValues[store.id] || ""}
                onChange={(e) =>
                  setRatingValues({
                    ...ratingValues,
                    [store.id]: e.target.value,
                  })
                }
              >
                <option value="">Select rating</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} ⭐
                  </option>
                ))}
              </select>

              <button
                onClick={() => submitRating(store.id)}
              >
                {store.userSubmittedRating
                  ? "Update Rating"
                  : "Submit Rating"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="empty-state">
          No stores found.
        </div>
      )}
    </div>
  );
};

export default UserDashboard;