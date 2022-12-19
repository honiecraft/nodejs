import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import convertMoney from "../../../util/convertMoney";
import { AuthContext } from "../../../context/AuthContext";
import HistoryAPI from "../../../API/HistoryAPI";

function DetailHistory(props) {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [order, setOrder] = useState();

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await HistoryAPI.getOrders(user._id, id);
      setOrder(response[0]);
    };
    fetchOrder();
  }, []);

  return (
    <div className="container">
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row px-4 px-lg-5 py-lg-4 align-items-center">
            <div className="col-lg-6">
              <h1 className="h2 text-uppercase mb-0">Detail Order</h1>
            </div>
            <div className="col-lg-6 text-lg-right">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-lg-end mb-0 px-0">
                  <li className="breadcrumb-item active">Detail</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <div className="p-5">
        <h1 className="h2 text-uppercase">Information Order</h1>
        {order && (
          <>
            <p>ID User: {order.user.userId._id}</p>
            <p>Full Name: {order.user.userId.fullname}</p>
            <p>Phone: {order.user.userId.phone}</p>
            <p>Address: {order.user.userId.address}</p>
            <p>
              Total: {" "}
              {convertMoney(order.total)} VND
            </p>
          </>
        )}
      </div>
      <div className="table-responsive pt-5 pb-5">
        <table className="table">
          <thead className="bg-light">
            <tr className="text-center">
              <th className="border-0" scope="col">
                {" "}
                <strong className="text-small text-uppercase">
                  ID Product
                </strong>
              </th>
              <th className="border-0" scope="col">
                {" "}
                <strong className="text-small text-uppercase">Image</strong>
              </th>
              <th className="border-0" scope="col">
                {" "}
                <strong className="text-small text-uppercase">Name</strong>
              </th>
              <th className="border-0" scope="col">
                {" "}
                <strong className="text-small text-uppercase">Price</strong>
              </th>
              <th className="border-0" scope="col">
                {" "}
                <strong className="text-small text-uppercase">Count</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            {order &&
              order.products?.map((p) => (
                <tr className="text-center" key={p.product._id}>
                  <td className="align-middle border-0">
                    <h6 className="mb-0">{p.product._id}</h6>
                  </td>
                  <td className="pl-0 border-0">
                    <div className="media align-items-center justify-content-center">
                      <Link
                        className="reset-anchor d-block animsition-link"
                        to={`/detail/${p.product._id}`}
                      >
                        <img
                          src={p.product.img1}
                          alt={p.product.name}
                          width="200"
                        />
                      </Link>
                    </div>
                  </td>
                  <td className="align-middle border-0">
                    <h6 className="mb-0">{p.product.name}</h6>
                  </td>
                  <td className="align-middle border-0">
                    <h6 className="mb-0">
                      {convertMoney(p.product.price)} VND
                    </h6>
                  </td>
                  <td className="align-middle border-0">
                    <h6 className="mb-0">{p.quantity}</h6>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DetailHistory;
