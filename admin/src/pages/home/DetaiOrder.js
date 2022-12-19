import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import convertMoney from "../../util/convertMoney";
import { AuthContext } from "../../context/AuthContext";
import HistoryAPI from "../../api/HistoryAPI";
import "./home.css";

function DetailOrder(props) {
  const { user } = useContext(AuthContext);
  const { orderId } = useParams();
  const [order, setOrder] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      const response = await HistoryAPI.getOrder(orderId);
      setOrder(response);
      setIsLoading(false);
    };
    fetchOrder();
  }, []);

  return (
    <div className="listContainer">
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row px-4 px-lg-5 py-lg-4 align-items-center">
            <div className="col-lg-6">
              <h1 className="h2 text-uppercase mb-0">Detail Order</h1>
              {order && (
                <div className="inforOrder">
                  <p>ID User: {order.user.userId._id}</p>
                  <p>Full Name: {order.user.userId.fullname}</p>
                  <p>Phone: {order.user.userId.phone}</p>
                  <p>Address: {order.user.userId.address}</p>
                  <p>Total: {convertMoney(order.total)} VND</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="table-responsive pt-5 pb-5">
        <table className="table">
          <thead className="bg-light">
            <tr className="text-center orderDetail">
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

          <tbody className="orderProduct">
            {order &&
              order.products?.map((p) => (
                <tr className="text-center" key={p.product._id}>
                  <td className="align-middle border-0">
                    <h6 className="mb-0">{p.product._id}</h6>
                  </td>
                  <td className="pl-0 border-0">
                    <div className="media align-items-center justify-content-center">
                      <img
                        src={p.product.img1}
                        alt={p.product.name}
                        width="200"
                      />
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

export default DetailOrder;
