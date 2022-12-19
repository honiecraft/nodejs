import { useState } from "react";
import TextField from "@mui/material/TextField";
import DataGrid from "../../components/dataGrid/DataGrid";
import "./list.css";

const List = ({ col }) => {
  const [query, setQuery] = useState("");

  return (
    <div className="listContainer">
      <h6 className="px-2">Products</h6>
      <TextField
        id="outlined-basic"
        size="small"
        placeholder="Enter Search!"
        style={{ padding: "10px" }}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
      <DataGrid col={col} query={query} />
    </div>
  );
};

export default List;
