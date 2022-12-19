import { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import "./App.css";

import { AuthContext } from "./context/AuthContext";
import { transCol, productsCol } from "./template/dataGrid";
import ErrPage500 from "./pages/error/500";
import ErrPage404 from "./pages/error/404";
import Topbar from "./components/topbar/Topbar";
import Sidebar from "./components/sidebar/Sidebar";
import Chat from "./pages/chat/Chat";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import DetailOrder from "./pages/home/DetaiOrder";
import List from "./pages/list/List";
import ProductForm from "./pages/productForm/ProductForm";

function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const RequireAuth = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    } else if (!user.isAdmin) {
      return <Navigate to="/messages" />;
    }
    return children;
  };

  return (
    <div className="App wrapper">
      {path !== "login" && <Sidebar />}

      <div className="appContainer">
        {path !== "login" && <Topbar />}
        <Routes>
          <Route path="/">
            <Route path="/login" element={<Login />} />
            <Route
              index
              element={
                <RequireAuth>
                  <Home col={transCol} />
                </RequireAuth>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <RequireAuth>
                  <DetailOrder />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="/products">
            <Route
              index
              element={
                <RequireAuth>
                  <List col={productsCol} />
                </RequireAuth>
              }
            />
            <Route
              path=":productId"
              element={
                <RequireAuth>
                  <ProductForm />
                </RequireAuth>
              }
            />
            <Route
              path="new"
              element={
                <RequireAuth>
                  <ProductForm />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="/messages" element={<Chat />} />
          <Route path="/500" element={<ErrPage500 />} />
          <Route path="*" element={<ErrPage404 />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
