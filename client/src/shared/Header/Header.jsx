import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import alertify from "alertifyjs";
import { AuthContext } from "../../context/AuthContext";
import LoginLink from "../../pages/Auth/Component/LoginLink";
import LogoutLink from "../../pages/Auth/Component/LogoutLink";
import Name from "../../pages/Auth/Component/Name";

function Header(props) {
  const location = useLocation();
  const path = location.pathname;
  const { user } = useContext(AuthContext);

  const handleRedirectToCart = () => {
    if (!user) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Vui lòng đăng nhập để xem giỏ hàng!");
    }
    return;
  };

  return (
    <div className="container px-0 px-lg-3">
      <nav className="navbar navbar-expand-lg navbar-light py-3 px-lg-0">
        <Link className="navbar-brand" to={`/`}>
          <span className="font-weight-bold text-uppercase text-dark">
            Boutique
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link
                className="nav-link"
                to={`/`}
                style={path === "" ? { color: "#dcb14a" } : { color: "black" }}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to={`/shop`}
                style={
                  path === "/shop" ? { color: "#dcb14a" } : { color: "black" }
                }
              >
                Shop
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item" onClick={handleRedirectToCart}>
              <Link
                className="nav-link"
                to={user ? `/cart` : null}
                style={
                  path === "/cart" ? { color: "#dcb14a" } : { color: "black" }
                }
              >
                <i className="fas fa-dolly-flatbed mr-1 text-gray"></i>
                Cart
              </Link>
            </li>
            {user && <Name />}
            {user ? <LoginLink /> : <LogoutLink />}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Header;
