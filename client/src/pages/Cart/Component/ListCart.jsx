import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import alertify from "alertifyjs";

import convertMoney from "../../../util/convertMoney";
import ProductAPI from "../../../API/ProductAPI";

import "./ListCart.css";

ListCart.propTypes = {
  listCart: PropTypes.array,
  onDeleteCart: PropTypes.func,
  onUpdateCount: PropTypes.func,
};

ListCart.defaultProps = {
  listCart: [],
  onDeleteCart: null,
  onUpdateCount: null,
};

function ListCart(props) {
  const { listCart, onDeleteCart, onUpdateCount } = props;
  const [cartItems, setCartItems] = useState();
  const [inputQty, setInputQty] = useState({});
  //const [disIncBtn, setDisIncBtn] = useState(false);
  //const [disDecBtn, setDisDecBtn] = useState(false);
  const [disBtn, setDisBtn] = useState({});

  useEffect(() => {
    setCartItems([...listCart]);
    listCart.forEach((i) => {
      const keyId = i.productId._id;
      const quantity = i.quantity;
      const availableQty = i.productId.stockQty;

      setInputQty((prev) => ({ ...prev, [keyId]: Math.min(availableQty, quantity) }));
      setdisBtn((prev) => ({ ...prev, [keyId]: {inc: false, dec: false} }));
    });
  }, [listCart]);

  const handleDisplayBtn = (inp, avl, prodId) => {
    let tempBtn = {...disBtn}
    if (avl === 1 || avl === 0) {
      tempBtn[prodId] = {inc: true, dec: true};      
    } else if (inp >= avl) {
      tempBtn[prodId] = {inc: true, dec: false};         
    } else if (inp < avl) {
      if (inp > 1) {
        tempBtn[prodId] = {inc: false, dec: false};        
      } else if (inp === 1) {
        tempBtn[prodId] = {inc: false, dec: true};        
      }
    }
    setdisBtn({...tempBtn});
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInputQty((prev) => ({ ...prev, [id]: value }));
  };

  const handleChange = (prodId, v) => {
    const value = parseInt(v);

    // Get index of selected item in listCart array
    const productIndex = listCart.indexOf(
      listCart.filter((item) => {
        return item.productId._id === prodId;
      })[0]
    );

    // If qty blank or equal 0
    if (!value || value === 0) {
      // return original value
      setInputQty((prev) => ({
        ...prev,
        [prodId]: cartItems[productIndex].quantity,
      }));
      return;
    }

    // Get instock quantity of cart product
    const availableQty = listCart[productIndex].productId.stockQty;
    let updateCart = [...listCart];

    handleDisplayBtn(value, availableQty, prodId);
   
    // If input value > available
    if (availableQty <= value) {
      // set inputQty equal availableQty
      setInputQty((prev) => ({ ...prev, [prodId]: availableQty }));
      updateCart[productIndex].quantity = availableQty;
     
      // Alert not enough qty
      alertify.set("notifier", "position", "bottom-left");
      alertify.error(`Chỉ còn ${availableQty} sản phẩm.`);
      onUpdateCount(prodId, availableQty, updateCart);
    } else {            
      // Else update with input value     
      // If input value not change compare with previous state
      // do nothing
      if (inputQty[prodId] === value) {
        return;
      }
      // else update cart
      setInputQty((prev) => ({ ...prev, [prodId]: value }));
      updateCart[productIndex].quantity = value;
      onUpdateCount(prodId, value, updateCart);
    }
    setCartItems(updateCart);
  };

  const handlerDelete = (getProduct) => {
    if (!onDeleteCart) {
      return;
    }
    const updateCart = cartItems.filter((item) => {
      return item.productId._id !== getProduct;
    });

    setCartItems([...updateCart]);
    onDeleteCart(getProduct, updateCart);
  };

  //Decrease quantity
  const handlerDown = (getIdProduct, getCount) => {
    if (!onUpdateCount) {
      return;
    }
    
    //Trước khi trả dữ liệu về component cha thì phải thay đổi biến count
    const updateCount = parseInt(getCount) - 1;
    handleChange(getIdProduct, updateCount);
  };

  //Increase quantity
  const handlerUp = (getIdProduct, getCount) => {
    if (!onUpdateCount) {
      return;
    }

    //Trước khi trả dữ liệu về component cha thì phải thay đổi biến count
    const updateCount = parseInt(getCount) + 1;
    handleChange(getIdProduct, updateCount);
  };

  return (
    <div className="table-responsive mb-4">
      <table className="table">
        <thead className="bg-light">
          <tr className="text-center">
            <th className="border-0" scope="col">
              {" "}
              <strong className="text-small text-uppercase">Image</strong>
            </th>
            <th className="border-0" scope="col">
              {" "}
              <strong className="text-small text-uppercase">Product</strong>
            </th>
            <th className="border-0" scope="col">
              {" "}
              <strong className="text-small text-uppercase">Price</strong>
            </th>
            <th className="border-0" scope="col">
              {" "}
              <strong className="text-small text-uppercase">Quantity</strong>
            </th>
            <th className="border-0" scope="col">
              {" "}
              <strong className="text-small text-uppercase">Total</strong>
            </th>
            <th className="border-0" scope="col">
              {" "}
              <strong className="text-small text-uppercase">Remove</strong>
            </th>
          </tr>
        </thead>
        <tbody>
          {cartItems &&
            cartItems.map((item) => (
              <tr className="text-center" key={item.productId._id}>
                <td className="pl-0 border-0">
                  <div className="media align-items-center justify-content-center">
                    <Link
                      className="reset-anchor d-block animsition-link"
                      to={`/detail/${item.productId._id}`}
                    >
                      <img
                        src={item.productId.img1}
                        alt={item.productId.name}
                        width="70"
                      />
                    </Link>
                  </div>
                </td>
                <td className="align-middle border-0">
                  <div className="media align-items-center justify-content-center">
                    <Link
                      className="reset-anchor h6 animsition-link"
                      to={`/detail/${item.productId._id}`}
                    >
                      {item.productId.name}
                    </Link>
                  </div>
                </td>

                <td className="align-middle border-0">
                  <p className="mb-0 small">
                    {convertMoney(item.productId.price)} VND
                  </p>
                </td>
                <td className="align-middle border-0">
                  <div className="quantity justify-content-center">
                    <button
                      className="dec-btn p-0"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handlerDown(item.productId._id, item.quantity)
                      }
                      disabled={disBtn[item.productId._id].dec ? disBtn[item.productId._id].dec : null}
                    >
                      <i className="fas fa-caret-left"></i>
                    </button>
                    <input
                      className="form-control bg-white inputNumberQty form-control-sm border-0 shadow-0 p-0"
                      type="number"
                      value={inputQty[item.productId._id]}
                      id={item.productId._id}
                      onChange={handleInputChange}
                      onBlur={(e) =>
                        handleChange(
                          item.productId._id,
                          parseInt(inputQty[item.productId._id]),
                          "input"
                        )
                      }
                      disabled={
                        inputQty[item.productId._id] === 0 ? true : null
                      }
                    />
                    <button
                      className="inc-btn p-0"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handlerUp(item.productId._id, item.quantity)
                      }
                      disabled={disBtn[item.productId._id].inc ? disBtn[item.productId._id].inc : null}
                    >
                      <i className="fas fa-caret-right"></i>
                    </button>
                  </div>
                </td>
                <td className="align-middle border-0">
                  <p className="mb-0 small">
                    {convertMoney(
                      parseInt(item.productId.price) * parseInt(item.quantity)
                    )}{" "}
                    VND
                  </p>
                </td>
                <td className="align-middle border-0">
                  <a
                    className="reset-anchor remove_cart"
                    style={{ cursor: "pointer" }}
                    onClick={() => handlerDelete(item.productId._id)}
                  >
                    <i className="fas fa-trash-alt small text-muted"></i>
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListCart;
