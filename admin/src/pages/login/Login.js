import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./login.css";

import { AuthContext } from "../../context/AuthContext";
import UserAPI from "../../api/UserAPI";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const { isLoading, error, dispatch } = useContext(AuthContext);

  const [inputUser, setInputUser] = useState({ email: "", password: "" });
  const [errMessage, setErrMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidForm = validateForm();
    dispatch({ type: "LOGIN_START" });
    const submitLoginForm = async () => {
      try {
        dispatch({ type: "LOGIN_START" });
        const response = await UserAPI.postLogin(JSON.stringify(inputUser));
        if (response.role === "client") {
          dispatch({
            type: "LOGIN_FAIL",
            payload: { message: "Not allowed!" },
          });
          setErrMessage("Not allowed!");
        } else {
          if (response.details.email === inputUser.email) {
            const userData = {
              ...response.details,
              isAdmin: response.role === "admin",
            };
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: userData,
              payload2: response.token,
            });
            response.role === "admin" ? navigate("/") : navigate("/messages");
          }
        }
      } catch (err) {
        dispatch({
          type: "LOGIN_FAIL",
          payload: { message: err.response.data.message },
        });
        setErrMessage(err.response.data.message);
      }
    };

    if (isValidForm) {
      submitLoginForm();
    }
  };

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function validateForm() {
    if (!inputUser.email) {
      setErrMessage("Please enter your email address");
      return false;
    } else if (!validateEmail(inputUser.email)) {
      setErrMessage("Please enter valid email address");
      return false;
    } else if (!inputUser.password) {
      setErrMessage("Please enter your Password");
      return false;
    } else if (inputUser.password.length < 5) {
      setErrMessage("Password needs to be at least 5 characters");
      return false;
    } else {
      setErrMessage(null);
      return true;
    }
  }

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-50">
          <span className="login100-form-title p-b-33">Login</span>

          <div className="d-flex justify-content-center pb-5">
            {errMessage && <span className="text-danger">* {errMessage}</span>}
          </div>

          <div className="wrap-input100 validate-input">
            <input
              className="input100"
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={inputUser.username}
              onChange={handleChange}
            />
          </div>

          <div className="wrap-input100 rs1 validate-input">
            <input
              className="input100"
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={inputUser.password}
              onChange={handleChange}
            />
          </div>

          <div className="container-login100-form-btn m-t-20">
            <button className="login100-form-btn" onClick={handleSubmit}>
              {isLoading ? "Loading..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
