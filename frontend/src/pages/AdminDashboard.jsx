import { useEffect, useState } from "react";
import api from "../services/api";

const emptyUserForm = {
  name: "",
  email: "",
  address: "",
  password: "",
  role: "USER",
};

const emptyStoreForm = {
  name: "",
  email: "",
  address: "",
  ownerId: "",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [userSort, setUserSort] = useState({
    sortBy: "name",
    sortOrder: "asc",
  });

  const [storeSort, setStoreSort] = useState({
    sortBy: "name",
    sortOrder: "asc",
  });

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [storeForm, setStoreForm] = useState(emptyStoreForm);

  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      setError("Failed to load dashboard");
    }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();

      Object.entries(userFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      params.append("sortBy", userSort.sortBy);
      params.append("sortOrder", userSort.sortOrder);

      const response = await api.get(
        `/admin/users?${params.toString()}`
      );

      setUsers(response.data.users);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load users"
      );
    }
  };

  const loadStores = async () => {
    try {
      const params = new URLSearchParams();

      Object.entries(storeFilters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      params.append("sortBy", storeSort.sortBy);
      params.append("sortOrder", storeSort.sortOrder);

      const response = await api.get(
        `/stores?${params.toString()}`
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
    loadDashboard();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [userFilters, userSort]);

  useEffect(() => {
    loadStores();
  }, [storeFilters, storeSort]);

  const updateUserFilter = (field, value) => {
    setUserFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateStoreFilter = (field, value) => {
    setStoreFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleUserFormChange = (e) => {
    setUserForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStoreFormChange = (e) => {
    setStoreForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const createUser = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await api.post("/admin/users", userForm);

      setMessage("User created successfully");
      setUserForm(emptyUserForm);
      setShowUserForm(false);

      await loadUsers();
      await loadDashboard();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create user"
      );
    }
  };

  const createStore = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const payload = {
        name: storeForm.name,
        email: storeForm.email,
        address: storeForm.address,
      };

      if (storeForm.ownerId) {
        payload.ownerId = Number(storeForm.ownerId);
      }

      await api.post("/stores", payload);

      setMessage("Store created successfully");
      setStoreForm(emptyStoreForm);
      setShowStoreForm(false);

      await loadStores();
      await loadDashboard();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create store"
      );
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      setError("");

      const response = await api.get(
        `/admin/users/${userId}`
      );

      setSelectedUser(response.data.user);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load user details"
      );
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, stores and ratings</p>
        </div>
      </div>

      {message && (
        <div className="success-message">{message}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Statistics */}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Users</span>
          <strong>{stats.totalUsers}</strong>
        </div>

        <div className="stat-card">
          <span>Total Stores</span>
          <strong>{stats.totalStores}</strong>
        </div>

        <div className="stat-card">
          <span>Total Ratings</span>
          <strong>{stats.totalRatings}</strong>
        </div>
      </div>

      {/* Actions */}

      <div className="admin-actions">
        <button
          className="primary-button"
          onClick={() => {
            setShowUserForm(!showUserForm);
            setShowStoreForm(false);
          }}
        >
          {showUserForm ? "Close" : "+ Add User"}
        </button>

        <button
          className="primary-button"
          onClick={() => {
            setShowStoreForm(!showStoreForm);
            setShowUserForm(false);
          }}
        >
          {showStoreForm ? "Close" : "+ Add Store"}
        </button>
      </div>

      {/* Add User */}

      {showUserForm && (
        <div className="form-card">
          <h2>Add User</h2>

          <form onSubmit={createUser} className="admin-form">
            <div>
              <label>Name</label>
              <input
                name="name"
                value={userForm.name}
                onChange={handleUserFormChange}
                minLength={20}
                maxLength={60}
                placeholder="20-60 characters"
                required
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                required
              />
            </div>

            <div>
              <label>Address</label>
              <textarea
                name="address"
                value={userForm.address}
                onChange={handleUserFormChange}
                maxLength={400}
                required
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                minLength={8}
                maxLength={16}
                placeholder="Uppercase + special character"
                required
              />
            </div>

            <div>
              <label>Role</label>
              <select
                name="role"
                value={userForm.role}
                onChange={handleUserFormChange}
              >
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">
                  Store Owner
                </option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <button type="submit" className="primary-button">
              Create User
            </button>
          </form>
        </div>
      )}

      {/* Add Store */}

      {showStoreForm && (
        <div className="form-card">
          <h2>Add Store</h2>

          <form onSubmit={createStore} className="admin-form">
            <div>
              <label>Store Name</label>
              <input
                name="name"
                value={storeForm.name}
                onChange={handleStoreFormChange}
                minLength={20}
                maxLength={60}
                placeholder="20-60 characters"
                required
              />
            </div>

            <div>
              <label>Store Email</label>
              <input
                type="email"
                name="email"
                value={storeForm.email}
                onChange={handleStoreFormChange}
                required
              />
            </div>

            <div>
              <label>Address</label>
              <textarea
                name="address"
                value={storeForm.address}
                onChange={handleStoreFormChange}
                maxLength={400}
                required
              />
            </div>

            <div>
              <label>Store Owner ID</label>
              <input
                type="number"
                name="ownerId"
                value={storeForm.ownerId}
                onChange={handleStoreFormChange}
                placeholder="Optional"
                min="1"
              />
            </div>

            <button type="submit" className="primary-button">
              Create Store
            </button>
          </form>
        </div>
      )}

      {/* Users */}

      <div className="table-card">
        <div className="section-heading">
          <div>
            <h2>Users</h2>
            <p>Search, filter and manage registered users.</p>
          </div>
        </div>

        <div className="filter-grid">
          <input
            placeholder="Filter by name"
            value={userFilters.name}
            onChange={(e) =>
              updateUserFilter("name", e.target.value)
            }
          />

          <input
            placeholder="Filter by email"
            value={userFilters.email}
            onChange={(e) =>
              updateUserFilter("email", e.target.value)
            }
          />

          <input
            placeholder="Filter by address"
            value={userFilters.address}
            onChange={(e) =>
              updateUserFilter("address", e.target.value)
            }
          />

          <select
            value={userFilters.role}
            onChange={(e) =>
              updateUserFilter("role", e.target.value)
            }
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="STORE_OWNER">
              Store Owner
            </option>
          </select>

          <select
            value={userSort.sortBy}
            onChange={(e) =>
              setUserSort((previous) => ({
                ...previous,
                sortBy: e.target.value,
              }))
            }
          >
            <option value="name">Sort: Name</option>
            <option value="email">Sort: Email</option>
            <option value="address">Sort: Address</option>
            <option value="role">Sort: Role</option>
          </select>

          <button
            className="secondary-button"
            onClick={() =>
              setUserSort((previous) => ({
                ...previous,
                sortOrder:
                  previous.sortOrder === "asc"
                    ? "desc"
                    : "asc",
              }))
            }
          >
            {userSort.sortOrder === "asc"
              ? "↑ Asc"
              : "↓ Desc"}
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>
                    <span className="role-badge">
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <button
                      className="small-button"
                      onClick={() =>
                        viewUserDetails(user.id)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="empty-state">
            No users found.
          </div>
        )}
      </div>

      {/* User Details */}

      {selectedUser && (
        <div className="detail-card">
          <div className="section-heading">
            <h2>User Details</h2>

            <button
              className="small-button"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>

          <div className="detail-grid">
            <div>
              <span>Name</span>
              <strong>{selectedUser.name}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{selectedUser.email}</strong>
            </div>

            <div>
              <span>Address</span>
              <strong>{selectedUser.address}</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>
                {selectedUser.role.replace("_", " ")}
              </strong>
            </div>

            {selectedUser.role === "STORE_OWNER" && (
              <div>
                <span>Store Rating</span>
                <strong>
                  {selectedUser.storeRating} ⭐
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stores */}

      <div className="table-card">
        <div className="section-heading">
          <div>
            <h2>Stores</h2>
            <p>Search, filter and sort registered stores.</p>
          </div>
        </div>

        <div className="filter-grid">
          <input
            placeholder="Filter by name"
            value={storeFilters.name}
            onChange={(e) =>
              updateStoreFilter("name", e.target.value)
            }
          />

          <input
            placeholder="Filter by email"
            value={storeFilters.email}
            onChange={(e) =>
              updateStoreFilter("email", e.target.value)
            }
          />

          <input
            placeholder="Filter by address"
            value={storeFilters.address}
            onChange={(e) =>
              updateStoreFilter("address", e.target.value)
            }
          />

          <select
            value={storeSort.sortBy}
            onChange={(e) =>
              setStoreSort((previous) => ({
                ...previous,
                sortBy: e.target.value,
              }))
            }
          >
            <option value="name">Sort: Name</option>
            <option value="email">Sort: Email</option>
            <option value="address">Sort: Address</option>
            <option value="rating">Sort: Rating</option>
          </select>

          <button
            className="secondary-button"
            onClick={() =>
              setStoreSort((previous) => ({
                ...previous,
                sortOrder:
                  previous.sortOrder === "asc"
                    ? "desc"
                    : "asc",
              }))
            }
          >
            {storeSort.sortOrder === "asc"
              ? "↑ Asc"
              : "↓ Desc"}
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Rating</th>
              </tr>
            </thead>

            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>{store.rating} ⭐</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stores.length === 0 && (
          <div className="empty-state">
            No stores found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;