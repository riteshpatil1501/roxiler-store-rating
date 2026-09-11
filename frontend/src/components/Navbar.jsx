import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Store<span>Rating</span>
      </Link>

      <div className="nav-right">
        <div className="user-info">
          <strong>{user.name}</strong>
          <span>{user.role.replace("_", " ")}</span>
        </div>

        <Link to="/" className="nav-link">
          Dashboard
        </Link>

        <Link to="/change-password" className="nav-link">
          Change Password
        </Link>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;