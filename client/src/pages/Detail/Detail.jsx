import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import alertify from "alertifyjs";
import { AuthContext } from "../../context/AuthContext";
import convertMoney from "../../util/convertMoney";
import CartAPI from "../../API/CartAPI";
import ProductAPI from "../../API/ProductAPI";
import "./Detail.css";
import io from "socket.io-client";

function Detail(props) {
  const { user } = useContext(AuthContext);
  const [detail, setDetail] = useState({});

  //id params cho từng sản phẩm
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [outOfStock, setOutOfStock] = useState(false);
  const [lowStock, setLowStock] = useState(false);
  const [arrivalOrder, setArrivalOrder] = useState(null);
  const socket = useRef();

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SERVER_URL);
    socket.current.on("post_order", (data) => {
      setArrivalOrder(data);
    });
  }, []);

  useEffect(() => {
    const orderProduct =
      arrivalOrder &&
      arrivalOrder.productList.filter((p) => p.product._id === id)[0];

    if (orderProduct) {
      const updatedProduct = { ...detail };
      updatedProduct.stockQty -= orderProduct.quantity;
      setDetail(updatedProduct);

      if (updatedProduct.stockQty === 0) {
        setOutOfStock(true);
      } else if (updatedProduct.stockQty < 5) {
        setLowStock(true);
      }
    }
  }, [arrivalOrder]);

  //Hàm này để lấy dữ liệu chi tiết sản phẩm
  useEffect(() => {
    fetchDetailData();
  }, [id]);

  async function fetchDetailData() {
    const response = await ProductAPI.getDetail(id);
    setDetail(response);

    if (response.stockQty === 0) {
      setOutOfStock(true);
    } else if (response.stockQty < 5) {
      setLowStock(true);
    }
  }

  //Hàm này gọi API và cắt chỉ lấy 4 sản phẩm
  useEffect(() => {
    async function fetchData() {
      const response = await ProductAPI.getAPI();
      setProduct(response);
    }
    fetchData();
  }, []);

  //Phần này là để thay đổi số lượng khi mua sản phẩm
  const [text, setText] = useState(1);

  const onChangeText = (e) => {
    const value = parseInt(e.target.value);

    if (!value || value === 0) {
      return setText(1);
    }

    if (value > detail.stockQty) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Vượt quá số lượng tồn kho !");
      setText(detail.stockQty);
      return;
    }
    setText(value);
  };

  //Tăng lên 1 đơn vị
  const upText = () => {
    const value = parseInt(text) + 1;

    if (outOfStock) {
      return;
    }

    if (value > detail.stockQty) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Vượt quá số lượng tồn kho !");
      return;
    }

    setText(value);
  };

  //Giảm 1 đơn vị
  const downText = () => {
    const value = parseInt(text) - 1;

    if (value === 0) {
      return;
    } else setText(value);
  };

  //Hàm này là Thêm Sản Phẩm
  const addToCart = async () => {
    if (!user) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Vui lòng đăng nhập để xem giỏ hàng !");
      return;
    }

    if (text > detail.stockQty) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Vượt quá số lượng tồn kho !");
      return;
    }

    if (!text || isNaN(text)) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error("Số lượng không hợp lệ !");
      return;
    }

    const res = await CartAPI.postAddToCart(
      user._id,
      JSON.stringify({ prodId: id, qty: text })
    );

    if (res.status === 406 && res.message === `Over stock limit.`) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.error(`Chỉ có thể đặt thêm ${res.availableQty} sản phẩm.`);
      return;
    }
    alertify.set("notifier", "position", "bottom-left");
    alertify.success("Bạn Đã Thêm Hàng Thành Công !");
    setText(1);
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="row mb-5">
          <div className="col-lg-6">
            <div className="row m-sm-0">
              <div className="col-sm-2 p-sm-0 order-2 order-sm-1 mt-2 mt-sm-0">
                <div
                  className="owl-thumbs d-flex flex-row flex-sm-column"
                  data-slider-id="1"
                >
                  <div className="owl-thumb-item flex-fill mb-2 mr-2 mr-sm-0">
                    <img className="w-100" src={detail.img1} alt="..." />
                  </div>
                  <div className="owl-thumb-item flex-fill mb-2 mr-2 mr-sm-0">
                    <img className="w-100" src={detail.img2} alt="..." />
                  </div>
                  <div className="owl-thumb-item flex-fill mb-2 mr-2 mr-sm-0">
                    <img className="w-100" src={detail.img3} alt="..." />
                  </div>
                  <div className="owl-thumb-item flex-fill mb-2 mr-2 mr-sm-0">
                    <img className="w-100" src={detail.img4} alt="..." />
                  </div>
                </div>
              </div>

              <div
                id="carouselExampleControls"
                className="carousel slide col-sm-10 order-1 order-sm-2"
                data-ride="carousel"
              >
                <div className="carousel-inner owl-carousel product-slider">
                  <div className="carousel-item active">
                    <img
                      className="d-block w-100"
                      src={detail.img1}
                      alt="First slide"
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      className="d-block w-100"
                      src={detail.img2}
                      alt="Second slide"
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      className="d-block w-100"
                      src={detail.img3}
                      alt="Third slide"
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      className="d-block w-100"
                      src={detail.img4}
                      alt="Third slide"
                    />
                  </div>
                </div>
                <a
                  className="carousel-control-prev"
                  href="#carouselExampleControls"
                  role="button"
                  data-slide="prev"
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="sr-only">Previous</span>
                </a>
                <a
                  className="carousel-control-next"
                  href="#carouselExampleControls"
                  role="button"
                  data-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="sr-only">Next</span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <br></br>
            <h1>{detail.name}</h1>
            <br></br>
            <p className="text-muted lead">{convertMoney(detail.price)} VND</p>
            <br></br>
            <p className="text-small mb-4">{detail.short_desc}</p>
            <ul className="list-unstyled small d-inline-block">
              <li className="mb-1 bg-white text-muted">
                <strong className="text-uppercase text-dark">Category:</strong>
                <span className="reset-anchor text-uppercase ml-2">
                  {detail.category}S
                </span>{" "}
                {outOfStock && (
                  <>
                    <span>|</span>{" "}
                    <span className="text-danger font-weight-bold">
                      Hết hàng
                    </span>
                  </>
                )}
              </li>
            </ul>
            <div className="row align-items-end">
              <div className="col-sm-5 pr-sm-0">
                <div className="border d-flex align-items-center justify-content-between py-1 px-3 bg-white border-white">
                  <span className="small text-uppercase text-gray mr-4 no-select">
                    Quantity
                  </span>
                  <div className="quantity">
                    <button
                      className="dec-btn p-0"
                      style={{ cursor: "pointer" }}
                      onClick={downText}
                    >
                      <i className="fas fa-caret-left"></i>
                    </button>
                    <input
                      className="form-control bg-white border-0 shadow-0 p-0"
                      id="inputNumber"
                      type="number"
                      value={text}
                      onChange={onChangeText}
                      disabled={outOfStock ? true : null}
                    />
                    <button
                      className="inc-btn p-0 disabled"
                      style={{ cursor: "pointer" }}
                      onClick={upText}
                    >
                      <i className="fas fa-caret-right"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-sm-3 pl-sm-0">
                <button
                  className="btn btn-dark btn-sm btn-block d-flex align-items-center justify-content-center px-0 text-white"
                  disabled={outOfStock}
                  onClick={addToCart}
                >
                  Add to cart
                </button>
              </div>
              <br></br>
              <br></br>
            </div>
            {lowStock && (
              <div className="text-danger pt-1" style={{ fontSize: "14px" }}>
                Chỉ còn {detail.stockQty} sản phẩm
              </div>
            )}
          </div>
        </div>
        <br />
        <ul className="nav nav-tabs border-0">
          <li className="nav-item">
            <a
              className="nav-link fix_comment"
              style={{ backgroundColor: "#383838", color: "#ffffff" }}
            >
              Description
            </a>
          </li>
        </ul>
        <div className="tab-content mb-5">
          <div className="tab-pane fade show active">
            <div className="pt-4 pb-4 bg-white">
              <h6 className="text-uppercase">Product description </h6>
              <br></br>
              <p
                className="text-muted text-small mb-0"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {detail.long_desc}
              </p>
            </div>
          </div>
        </div>
        <h2 className="h5 text-uppercase mb-4">Related products</h2>
        <div className="row">
          {product &&
            product
              .filter(
                (el) => el.category === detail.category && el._id !== detail._id
              )
              .splice(0, 4)
              .map((value) => (
                <div className="col-lg-3 col-sm-6" key={value._id}>
                  <div className="product text-center skel-loader">
                    <div className="d-block mb-3 position-relative">
                      <img
                        className="img-fluid w-100"
                        src={value.img1}
                        alt={value.name}
                      />
                      <div className="product-overlay">
                        <ul className="mb-0 list-inline"></ul>
                      </div>
                    </div>
                    <h6>
                      <Link
                        className="reset-anchor"
                        to={`/detail/${value._id}`}
                      >
                        {value.name}
                      </Link>
                    </h6>
                    <p className="small text-muted">
                      {convertMoney(value.price)} VND
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export default Detail;
