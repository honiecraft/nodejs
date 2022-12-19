import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import AddBoxIcon from "@mui/icons-material/AddBox";
import MessageIcon from "@mui/icons-material/Message";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useContext } from "react";
import { Link } from "react-router-dom";

import UserAPI from "../../api/UserAPI";
import { AuthContext } from "../../context/AuthContext";

import "./sidebar.css";

const Sidebar = () => {
  const { user, isAdmin, dispatch } = useContext(AuthContext);

  // Handle logout
  const handleLogout = async () => {
    await UserAPI.getLogout(user._id);
    dispatch({ type: "LOGOUT" });
    sessionStorage.removeItem("token");
  };

  return (
    <div className="sidebar">
      <div className="sbtop">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="sblogo">Admin Page</span>
        </Link>
      </div>
      <div className="sbcenter">
        <ul>
          <p className="sbtitle">DASHBOARD</p>
          <Link to="/" style={{ textDecoration: "none" }}>
            <li className="sblist">
              <DashboardIcon className="sbicon" />
              <span>Home</span>
            </li>
          </Link>
          <Link to="/products" style={{ textDecoration: "none" }}>
            <li className="sblist">
              <InventoryIcon className="sbicon" />
              <span>Products</span>
            </li>
          </Link>
          <p className="sbtitle">NEW</p>
          <Link to="/products/new" style={{ textDecoration: "none" }}>
            <li className="sblist">
              <AddBoxIcon className="sbicon" />
              <span>New Product</span>
            </li>
          </Link>
          <p className="sbtitle">NOTIFICATIONS</p>
          <Link to="/messages" style={{ textDecoration: "none" }}>
            <li className="sblist">
              <MessageIcon className="sbicon" />
              <span>Messages</span>
            </li>
          </Link>
          <p className="sbtitle">USER</p>
          <Link
            to="/login"
            onClick={handleLogout}
            style={{ textDecoration: "none" }}
          >
            <li className="sblist">
              <ExitToAppIcon className="sbicon" />
              <span>Logout</span>
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
