import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./topbar.css";

const Topbar = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="navbar">
      {user && (
        <div className="nbWrapper">
          <div className="userInfor">
            <img
              src="https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
              alt=""
              className="nbItem avatar"
            />
            <p className="nbItem userName">{user.fullname}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
