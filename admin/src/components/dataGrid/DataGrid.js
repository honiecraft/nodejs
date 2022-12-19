import { Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import alertify from "alertifyjs";

import "./dataGrid.css";
import { StripedDataGrid } from "./StripedDataGrid";
import ProductAPI from "../../api/ProductAPI";
import HistoryAPI from "../../api/HistoryAPI";

const Datagrid = ({ col, query }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get data to render DataGrid
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const response = path
        ? await ProductAPI.getProducts()
        : await HistoryAPI.getOrders();
      setList(response);
    };
    fetchData();
    setIsLoading(false);
  }, []);

  // Handle Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Confirm to Delete?")) {
      const response = await ProductAPI.deleteProduct(id);
      if (response) {
        alertify.set("notifier", "position", "top-left");
        alertify.success(response.message);
        setList(list.filter((item) => item._id !== id));
      }
    } else return;
  };

  // Define Action column
  const actionColumn = [
    {
      field: "action",
      headerName: "Edit",
      width: 170,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/products/${params.id}`} className="link">
              <Button
                variant="contained"
                className="editButton"
                style={{ backgroundColor: "#22ca80" }}
              >
                Update
              </Button>
            </Link>
            <Button
              variant="contained"
              className="deleteButton"
              style={{ backgroundColor: "#ff4f70" }}
              onClick={() => handleDelete(params.row._id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  // Condition to render DataGrid
  let columnType;
  let title;
  switch (path) {
    case "products":
      columnType = col.concat(actionColumn);
      title = "Products";
      break;
    default:
      columnType = col;
      title = "History";
  }

  return (
    <div className="datatable">
      <StripedDataGrid
        rows={list}
        columns={columnType}
        pageSize={9}
        rowsPerPageOptions={[9]}
        rowHeight={60}
        getRowId={(row) => row._id}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        filterModel={{
          items: [
            {
              columnField: "name",
              operatorValue: "contains",
              value: query,
            },
          ],
        }}
        autoHeight
        disableSelectionOnClick
        showCellRightBorder
        showColumnRightBorder
        disableColumnMenu
      />
    </div>
  );
};

export default Datagrid;
