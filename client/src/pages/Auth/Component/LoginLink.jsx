import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserAPI from "../../../API/UserAPI";
import { AuthContext } from "../../../context/AuthContext";

function LoginLink(props) {
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);

  const handleClick = async () => {
    await UserAPI.getLogout(user._id);
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("roomChat");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  return (
    <li className="nav-item" onClick={handleClick}>
      <Link className="nav-link" to="/">
        ( Logout )
      </Link>
    </li>
  );
}

export default LoginLink;
