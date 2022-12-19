import { useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "./App.css";
import "./css/custom.css";
import "./css/style.default.css";

import { AuthContext } from "./context/AuthContext";
import ErrPage500 from "./pages/Error/500"
import ErrPage404 from "./pages/Error/404"
import Header from "./shared/Header/Header";
import Footer from "./shared/Footer/Footer";
import Chat from "./shared/Chat/Chat";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Home from "./pages/Home/Home";
import Shop from "./pages/Shop/Shop";
import Detail from "./pages/Detail/Detail";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import History from "./pages/History/History";

function App() {
  const { user } = useContext(AuthContext);
  const RequireAuth = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <Cart />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/history/*"
            element={
              <RequireAuth>
                <History />
              </RequireAuth>
            }
          />
           <Route path="/500" element={<ErrPage500 />} />
          <Route path="*" element={<ErrPage404 />} />
        </Routes>
        {user && <Chat />}
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
