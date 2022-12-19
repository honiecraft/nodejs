import "./home.css";
import Widget from "../../components/widget/Widget";
import DataGrid from "../../components/dataGrid/DataGrid";

const Home = ({ col }) => {
  return (
    <div className="home">
      <h6 className="homeTitle">Dashboard</h6>
      <div className="widgets">
        <Widget type="user" />
        <Widget type="earning" />
        <Widget type="order" />
      </div>
      <div className="listContainer">
        <h6 className="px-2">History</h6>
        <DataGrid col={col} />
      </div>
    </div>
  );
};

export default Home;
