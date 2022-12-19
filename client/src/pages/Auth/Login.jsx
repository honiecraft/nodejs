import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import queryString from "query-string";
import "./Auth.css";
import { AuthContext } from "../../context/AuthContext";
import UserAPI from "../../API/UserAPI";
import CartAPI from "../../API/CartAPI";

function Login(props) {
  const navigate = useNavigate();
  const { user, isLoading, error, dispatch } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const isValidForm = validateForm();

    const submitLoginForm = async () => {
      try {
        dispatch({ type: "LOGIN_START" });
        const response = await UserAPI.postLogin(
          JSON.stringify({ email, password })
        );

        if (response.details.email === email) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: response.details,
            payload2: response.token,
          });
        }
        navigate("/");
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
    if (!email) {
      setErrMessage("Please enter your email address");
      return false;
    } else if (!validateEmail(email)) {
      setErrMessage("Please enter valid email address");
      return false;
    } else if (!password) {
      setErrMessage("Please enter your Password");
      return false;
    } else if (password.length < 5) {
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
              value={email}
              onChange={onChangeEmail}
            />
          </div>

          <div className="wrap-input100 rs1 validate-input">
            <input
              className="input100"
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={onChangePassword}
            />
          </div>

          <div className="container-login100-form-btn m-t-20">
            <button className="login100-form-btn" onClick={onSubmit}>
              {isLoading ? "Loading..." : "Login"}
            </button>
          </div>

          <div className="text-center p-t-45 p-b-4">
            <span className="txt1">Create an account?</span>
            &nbsp;
            <Link to="/signup" className="txt2 hov1">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
