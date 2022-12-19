import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import queryString from "query-string";
import UserAPI from "../../API/UserAPI";

import "./Auth.css";

SignUp.propTypes = {};

function SignUp(props) {
  const navigate = useNavigate();
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onChangeName = (e) => {
    setFullName(e.target.value);
  };
  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const onChangePhone = (e) => {
    setPhone(e.target.value);
  };

  const handlerSignUp = (e) => {
    e.preventDefault();
    const isValidForm = validateForm();

    const submitSignupForm = async () => {
      try {
        setLoading(true);
        await UserAPI.postSignUp(
          JSON.stringify({ fullname, email, password, phone })
        );
        setLoading(false);
        navigate("/login");
      } catch (err) {
        setErrMessage(err.response.data.message);
      }
    };

    if (isValidForm) {
      submitSignupForm();
    }
  };

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function validateForm() {
    if (!fullname) {
      setErrMessage("Please enter your Full Name");
      return false;
    } else if (fullname.length < 3) {
      setErrMessage("Full name needs to be at least 3 characters");
      return false;
    } else if (!email) {
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
    } else if (!phone) {
      setErrMessage("Please enter your phone number");
      return false;
    } else if (phone.length < 5) {
      setErrMessage("Phone number needs to be at least 5 characters");
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
          <span className="login100-form-title p-b-33">Sign Up</span>
          <div className="d-flex justify-content-center pb-5">
            {errMessage && <span className="text-danger">* {errMessage}</span>}
          </div>
          <div className="wrap-input100 validate-input">
            <input
              className="input100"
              value={fullname}
              name="fullName"
              id="fullName"
              onChange={onChangeName}
              type="text"
              placeholder="Full Name"
            />
          </div>

          <div className="wrap-input100 rs1 validate-input">
            <input
              className="input100"
              value={email}
              name="email"
              id="email"
              onChange={onChangeEmail}
              type="text"
              placeholder="Email"
            />
          </div>

          <div className="wrap-input100 rs1 validate-input">
            <input
              className="input100"
              value={password}
              name="password"
              id="password"
              onChange={onChangePassword}
              type="password"
              placeholder="Password"
            />
          </div>

          <div className="wrap-input100 rs1 validate-input">
            <input
              className="input100"
              value={phone}
              name="phone"
              id="phone"
              onChange={onChangePhone}
              type="text"
              placeholder="Phone"
            />
          </div>

          <div className="container-login100-form-btn m-t-20">
            <button className="login100-form-btn" onClick={handlerSignUp}>
              {loading ? "Loading..." : "Sign Up"}
            </button>
          </div>

          <div className="text-center p-t-45 p-b-4">
            <span className="txt1">Login?</span>
            &nbsp;
            <Link to="/login" className="txt2 hov1">
              Click
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
