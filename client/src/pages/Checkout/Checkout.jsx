import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import alertify from "alertifyjs";

import { AuthContext } from "../../context/AuthContext";
import CartAPI from "../../API/CartAPI";
import CheckoutAPI from "../../API/CheckoutAPI";
import UserAPI from "../../API/UserAPI";
import convertMoney from "../../util/convertMoney";

import "./Checkout.css";

import io from "socket.io-client";
const socket = io(process.env.REACT_APP_SERVER_URL);

function Checkout(props) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [arrivalOrder, setArrivalOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [unavailableItems, setUnavailableItems] = useState([]);
  const [carts, setCarts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [fullname, setFullname] = useState(user.fullname || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const socket = useRef();

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.on("post_order", (data) => {
      setArrivalOrder(data);
    });
  }, []);

  useEffect(() => {
    if (arrivalOrder && arrivalOrder.sender !== user._id) {
      const updatedCart = [...carts];

      updatedCart.map((i) => {
        arrivalOrder.productList.forEach((p) => {
          // Kiểm tra nếu số lượng tôn thay đổi
          if (p.product._id === i.productId._id) {
            i.quantity = i.quantity - p.quantity;

            // Thông báo
            alertify.set("notifier", "position", "bottom-left");
            alertify.success(`Thay đổi số lượng do đạt giới hạn tồn kho !`);
          }
        });
        return i;
      });
      setCarts(updatedCart);
      setArrivalOrder(null);
    }
  }, [arrivalOrder]);

  //Hàm này dùng để gọi API và render số sản phẩm
  useEffect(() => {
    async function fetchCart() {
      setIsLoading(true);
      const response = await CartAPI.getCart(user._id);
      if (response) {
        setCarts(response.cart.items);
        getTotal(response.cart.items);
      }
      setIsLoading(false);
    }
    fetchCart();
  }, []);

  //Hàm này dùng để tính tổng tiền carts
  function getTotal(carts) {
    let sub_total = 0;
    carts.forEach((value) => {
      return (sub_total +=
        parseInt(value.productId.price) * parseInt(value.quantity));
    });
    setTotal(sub_total);
  }

  // Lấy giá trị input khi nhập
  const onChangeName = (e) => {
    setFullname(e.target.value);
  };
  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const onChangePhone = (e) => {
    setPhone(e.target.value);
  };
  const onChangeAddress = (e) => {
    setAddress(e.target.value);
  };

  // Đặt hàng
  const handlerSubmit = (e) => {
    e.preventDefault();
    const isValidForm = validateForm();
    const submitOrderForm = async () => {
      try {
        setIsLoading(true);

        //Post order
        const savedOrder = await CheckoutAPI.postOrder(
          user._id,
          JSON.stringify({ fullname, email, phone, address, total })
        );

        if (
          savedOrder.status === 406 &&
          savedOrder.message === `Insufficient stock quantity`
        ) {
          setUnavailableItems(savedOrder.unavailableItems);
          setOpen(true);
        } else if (
          savedOrder.status === 406 &&
          (savedOrder.message === `Order with 0 quantity!` ||
            savedOrder.message === `Cart is Empty!`)
        ) {
          alertify.set("notifier", "position", "bottom-left");
          alertify.error(`Vui lòng kiểm tra giỏ hàng!`);
        } else {
          //Updata user information
          await UserAPI.putUpdate(
            user._id,
            JSON.stringify({ fullname, email, phone, address })
          );
          setSuccess(true);
        }
        setIsLoading(false);
      } catch (err) {
        setErrMessage(err.response.data.message);
      }
    };

    if (isValidForm) {
      if (!carts || carts.length < 1) {
        alertify.set("notifier", "position", "bottom-left");
        alertify.error(`Không có sản phẩm trong giỏ hàng !`);
      } else submitOrderForm();
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
    } else if (!phone) {
      setErrMessage("Please enter your phone number");
      return false;
    } else if (phone.length < 5) {
      setErrMessage("Phone number needs to be at least 5 characters");
      return false;
    } else if (!address) {
      setErrMessage("Please enter your Address");
      return false;
    } else if (address.length < 5) {
      setErrMessage("Address needs to be at least 5 characters");
      return false;
    } else {
      setErrMessage(null);
      return true;
    }
  }

  return (
    <div>
      {isLoading && (
        <div className="wrapper_loader">
          <div className="loader"></div>
        </div>
      )}

      <div className="container">
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row px-4 px-lg-5 py-lg-4 align-items-center">
              <div className="col-lg-6">
                <h1 className="h2 text-uppercase mb-0">Checkout</h1>
              </div>
              <div className="col-lg-6 text-lg-right">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb justify-content-lg-end mb-0 px-0">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/cart">Cart</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Checkout
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>

        {!success && (
          <section className="py-5">
            <h2 className="h5 text-uppercase mb-4">Billing details</h2>
            {errMessage && (
              <div
                className="text-danger col-lg-12"
                style={{ textAlign: "center" }}
              >
                * {errMessage}
              </div>
            )}
            <div className="row">
              <div className="col-lg-8">
                <form>
                  <div className="row">
                    <div className="col-lg-12 form-group">
                      <label
                        className="text-small text-uppercase"
                        htmlFor="Fullname"
                      >
                        Full Name:
                      </label>
                      <input
                        className="form-control form-control-lg"
                        value={fullname}
                        onChange={onChangeName}
                        type="text"
                        placeholder="Enter Your Full Name Here!"
                      />
                    </div>
                    <div className="col-lg-12 form-group">
                      <label
                        className="text-small text-uppercase"
                        htmlFor="Email"
                      >
                        Email:{" "}
                      </label>
                      <input
                        className="form-control form-control-lg"
                        value={email}
                        onChange={onChangeEmail}
                        type="text"
                        placeholder="Enter Your Email Here!"
                      />
                    </div>
                    <div className="col-lg-12 form-group">
                      <label
                        className="text-small text-uppercase"
                        htmlFor="Phone"
                      >
                        Phone Number:{" "}
                      </label>
                      <input
                        className="form-control form-control-lg"
                        value={phone}
                        onChange={onChangePhone}
                        type="text"
                        placeholder="Enter Your Phone Number Here!"
                      />
                    </div>
                    <div className="col-lg-12 form-group">
                      <label
                        className="text-small text-uppercase"
                        htmlFor="Address"
                      >
                        Address:{" "}
                      </label>
                      <input
                        className="form-control form-control-lg"
                        value={address}
                        onChange={onChangeAddress}
                        type="text"
                        placeholder="Enter Your Address Here!"
                      />
                    </div>
                    <div className="col-lg-12 form-group mt-3">
                      <a
                        className="btn btn-dark"
                        style={{ color: "white" }}
                        type="submit"
                        onClick={handlerSubmit}
                      >
                        Place order
                      </a>
                    </div>
                  </div>
                </form>
              </div>
              <div className="col-lg-4">
                <div className="card border-0 rounded-0 p-lg-4 bg-light">
                  <div className="card-body">
                    <h5 className="text-uppercase mb-4">Your order</h5>
                    <ul className="list-unstyled mb-0">
                      {carts &&
                        carts.map((value) => (
                          <div key={value.productId._id}>
                            <li className="d-flex align-items-center justify-content-between">
                              <strong className="small font-weight-bold">
                                {value.productId.name}
                              </strong>
                              <br></br>
                              <span className="text-muted small">
                                {convertMoney(value.productId.price)} VND x{" "}
                                {value.quantity}
                              </span>
                            </li>
                            <li className="border-bottom my-2"></li>
                          </div>
                        ))}
                      <li className="d-flex align-items-center justify-content-between">
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
            <div className="inforModal">
              <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  Sản phẩm vượt quá số lượng tồn kho
                </DialogTitle>
                <DialogContent>
                  <List
                    sx={{
                      width: "100%",
                      maxWidth: 360,
                    }}
                  >
                    {!isLoading &&
                      unavailableItems?.map((item) => {
                        return (
                          <>
                            <ListItem alignItems="flex-start" key={item.name}>
                              <ListItemAvatar>
                                <Avatar alt={item.name} src={item.img} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={item.name}
                                secondary={`Số lượng: ${item.stockQty}`}
                              />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </>
                        );
                      })}
                  </List>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpen(false)}>Đồng ý</Button>
                </DialogActions>
              </Dialog>
            </div>
          </section>
        )}

        {success && (
          <section className="py-5">
            <div className="p-5">
              <h1>You Have Successfully Ordered!</h1>
              <p style={{ fontSize: "1.2rem" }}>Please Check Your Email.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Checkout;
