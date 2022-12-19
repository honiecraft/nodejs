import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import alertify from "alertifyjs";

import { AuthContext } from "../../context/AuthContext";
import convertMoney from "../../util/convertMoney";
import CartAPI from "../../API/CartAPI";
import ListCart from "./Component/ListCart";
import io from "socket.io-client";

function Cart(props) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [arrivalOrder, setArrivalOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState();
  const socket = useRef();

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SERVER_URL);
    socket.current.on("post_order", (data) => {
      setArrivalOrder(data);
    });
  }, []);

  // Xử lí Arrival order
  useEffect(() => {
    const updatedCart = [...cart];

    arrivalOrder &&
      arrivalOrder.sender !== user._id &&
      updatedCart.map((i) => {
        arrivalOrder.productList.forEach((p) => {
          // Kiểm tra nếu số lượng tôn thay đổi
          if (p.product._id === i.productId._id) {
            i.quantity = Math.max(i.quantity - p.quantity, 0);

            // Cập nhật số lượng
            onUpdateCount(i.productId._id, i.quantity);
            alertify.set("notifier", "position", "bottom-left");
            alertify.success(`Thay đổi số lượng do đạt giới hạn tồn kho !`);
          }
        });
        return i;
      });
    setCart(updatedCart);
    // setArrivalOrder(null);
  }, [arrivalOrder]);

  useEffect(() => {
    async function fetchCart() {
      setIsLoading(true);
      const response = await CartAPI.getCart(user._id);
      if (response) {
        setCart(response.cart.items);
        getTotal(response.cart.items);
      }
      setIsLoading(false);
    }
    fetchCart();
  }, []);

  function getTotal(carts) {
    let sub_total = 0;
    carts.forEach((value) => {
      return (sub_total +=
        parseInt(value.productId.price) * parseInt(value.quantity));
    });
    setTotal(sub_total);
  }

  //Hàm này dùng để truyền xuống cho component con xử và trả ngược dữ liệu lại component cha
  async function onUpdateCount(getProduct, getCount, updateCart) {
    //Sau khi nhận được dữ liệu ở component con truyền lên thì sẽ gọi API xử lý dữ liệu
    const res = await CartAPI.updateCart(
      user._id,
      JSON.stringify({
        prodId: getProduct,
        qty: getCount,
      })
    );

    if (res.status === 406 && res.message === `Insufficient stock quantity`) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error(`Chỉ còn ${res.availableQty} sản phẩm.`);
      return;
    } else {
      updateCart && getTotal(updateCart);
      alertify.set("notifier", "position", "bottom-left");
      alertify.success("Cập Nhật Giỏ Hàng Thành Công!");
    }
  }

  async function onDeleteCart(getProduct, updateCart) {
    const response = await CartAPI.deleteCart(user._id, getProduct);
    if (response) {
      updateCart && getTotal(updateCart);
      alertify.set("notifier", "position", "bottom-left");
      alertify.success("Xóa Hàng Thành Công!");
    }
  }

  const onCheckout = () => {
    const noQty =
      cart.length > 0 &&
      cart.filter((i) => {
        return i.quantity === 0;
      }).length > 0;

    if (!user) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Vui Lòng Kiểm Tra Lại Đăng Nhập!");
      return;
    } else if (cart.length === 0 || noQty) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Vui Lòng Kiểm Tra Lại Giỏ Hàng!");
      return;
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="container">
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row px-4 px-lg-5 py-lg-4 align-items-center">
            <div className="col-lg-6">
              <h1 className="h2 text-uppercase mb-0">Cart</h1>
            </div>
            <div className="col-lg-6 text-lg-right">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-lg-end mb-0 px-0">
                  <li className="breadcrumb-item active" aria-current="page">
                    Cart
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>
      <section className="py-5">
        <h2 className="h5 text-uppercase mb-4">Shopping cart</h2>
        <div className="row">
          <div className="col-lg-8 mb-4 mb-lg-0">
            {isLoading ? (
              <p>Loading...</p>
            ) : !cart.length > 0 ? (
              <p className="mb-4 text-center">
                Giỏ hàng của bạn hiện chưa có sản phẩm nào
              </p>
            ) : (
              <ListCart
                listCart={cart}
                onDeleteCart={onDeleteCart}
                onUpdateCount={onUpdateCount}
              />
            )}

            <div className="bg-light px-4 py-3">
              <div className="row align-items-center text-center">
                <div className="col-md-6 mb-3 mb-md-0 text-md-left">
                  <Link
                    className="btn btn-link p-0 text-dark btn-sm"
                    to={`/shop`}
                  >
                    <i className="fas fa-long-arrow-alt-left mr-2"> </i>
                    Continue shopping
                  </Link>
                </div>
                <div className="col-md-6 text-md-right">
                  <span
                    className="btn btn-outline-dark btn-sm"
                    onClick={onCheckout}
                  >
                    Proceed to checkout
                    <i className="fas fa-long-arrow-alt-right ml-2"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 rounded-0 p-lg-4 bg-light">
              <div className="card-body">
                <h5 className="text-uppercase mb-4">Cart total</h5>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-center justify-content-between">
                    <strong className="text-uppercase small font-weight-bold">
                      Subtotal
                    </strong>
                    <span className="text-muted small">
                      {convertMoney(total)} VND
                    </span>
                  </li>
                  <li className="border-bottom my-2"></li>
                  <li className="d-flex align-items-center justify-content-between mb-4">
                    <strong className="text-uppercase small font-weight-bold">
                      Total
                    </strong>
                    <span>{convertMoney(total)} VND</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Cart;
