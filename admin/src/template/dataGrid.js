import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import convertMoney from "../util/convertMoney";

export const transCol = [
  {
    field: "userId",
    headerName: "ID User",
    width: 220,
  },
  {
    field: "fullname",
    headerName: "Name",
    width: 80,
  },

  {
    field: "phone",
    headerName: "Phone",
    width: 100,
  },
  {
    field: "address",
    headerName: "Address",
    width: 110,
  },
  {
    field: "total",
    headerName: "Total",
    width: 110,
    valueFormatter: ({ value }) => convertMoney(value),
  },
  {
    field: "delivery",
    headerName: "Delivery",
    width: 150,
    renderCell: (params) => {
      return !params.value ? "Chưa vận chuyển" : "Đang xử lý";
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => {
      return !params.value ? "Chưa thanh toán" : "Đã thanh toán";
    },
  },
  {
    field: "detail",
    headerName: "Detail",
    width: 100,
    renderCell: (params) => {
      return (
        <div className="cellAction">
          <Link to={`/orders/${params.id}`} className="link">
            <Button
              variant="contained"
              className="editButton"
              style={{ backgroundColor: "#22ca80" }}
            >
              View
            </Button>
          </Link>
        </div>
      );
    },
  },
];

export const productsCol = [
  { field: "_id", headerName: "ID", width: 210 },
  {
    field: "name",
    headerName: "Name",
    width: 350,
  },
  {
    field: "price",
    headerName: "Price",
    width: 150,
    valueFormatter: ({ value }) => convertMoney(value),
  },
  {
    field: "img1",
    headerName: "Image",
    width: 100,
    renderCell: (params) => {
      return (
        <img
          src={params.value}
          height="60"
          style={{ alignItems: "center" }}
        ></img>
      );
    },
  },
  {
    field: "category",
    headerName: "Category",
    width: 100,
  },
];
