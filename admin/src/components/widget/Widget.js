import { useEffect, useState } from "react";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";

import convertMoney from "../../util/convertMoney";
import UserAPI from "../../api/UserAPI";
import HistoryAPI from "../../api/HistoryAPI";

import "./widget.css";

const Widget = ({ type }) => {
  const [numberUsers, setNumberUser] = useState("");
  const [earningsOfMonth, setEarningsOfMonth] = useState("");
  const [numberNewOrders, setNumberNewOrders] = useState("");

  useEffect(() => {
    Promise.all([getNumberUsers(), getEarningsOfMonth(), getNumberNewOrders()]);
  }, []);

  async function getNumberUsers() {
    const response = await UserAPI.getNumberUsers();
    setNumberUser(response?.count || 0);
  }

  async function getEarningsOfMonth() {
    const response = await HistoryAPI.getEarningsOfMonth();
    setEarningsOfMonth(response[0]?.total || 0);
  }
  async function getNumberNewOrders() {
    const response = await HistoryAPI.getNumberNewOrders();
    setNumberNewOrders(response[0]?.count || 0);
  }

  let data;

  switch (type) {
    case "user":
      data = {
        title: "Clients",
        amount: numberUsers,
        isMoney: false,
        icon: <PersonAddAltIcon className="wdicon" />,
      };
      break;
    case "earning":
      data = {
        title: "Earnings of Month",
        amount: earningsOfMonth,
        isMoney: true,
        icon: <AttachMoneyIcon className="wdicon" />,
      };
      break;
    case "order":
      data = {
        title: "New Order",
        amount: numberNewOrders,
        isMoney: false,
        icon: <NoteAddOutlinedIcon className="wdicon" />,
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="wdleft">
        <span className="wdcounter">
          {convertMoney(data.amount)}
          {data.isMoney && <sup className="currUnit">VND</sup>}
        </span>
        <span className="wdtitle">{data.title}</span>
        <span className="wdlink">{data.link}</span>
      </div>
      <div className="wdright">{data.icon}</div>
    </div>
  );
};

export default Widget;
