import React, { useEffect, useState, useContext, useRef } from "react";
import alertify from "alertifyjs";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import UserAPI from "../../api/UserAPI";
import ChatRoomsAPI from "../../api/ChatRoomsAPI";
import { AuthContext } from "../../context/AuthContext";
import "./chat.css";

import io from "socket.io-client";

// Each conversation limit 2 person only
// Admin can view all conversation
// Consultant can view their conversation only
// Both can only send message to new conversation and their conversation only

function Chat(props) {
  const { user } = useContext(AuthContext);
  // Contact panel state
  const [allUsers, setAllUsers] = useState([]); // All user with status chat
  const [another, setAnother] = useState([]); // List of user exept current one
  const [activeChatRooms, setActiveChatRooms] = useState([]); // List room chat of current user
  // Input fiels state
  const [selectedUser, setSelectedUser] = useState(null); // Selected user on search
  const [searchText, setSearchText] = useState(""); // Input search text field
  const [textMessage, setTextMessage] = useState(""); // Input message field
  const [sendTo, setSendTo] = useState({ title: "", value: "" }); // Title send to room/user
  // Socket state
  const [newConversation, setNewConversation] = useState(""); // Arrival conversation
  const [arrivalMessage, setArrivalMessage] = useState(null); // Arriveal message
  const [roomClosed, setRoomClosed] = useState(null); // Arrival room closed
  // Current chat state
  const [currentChat, setCurrentChat] = useState(null); // Current chat id
  const [messages, setMessages] = useState([]); // Messages list of current chat
  const [readOnly, setReadOnly] = useState(false);
  // Other
  const socket = useRef();
  const scrollRef = useRef();

  // Receive socket key receive_message from server
  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SERVER_URL);
    socket.current.on("receive_message", (data) => {
      setArrivalMessage(data);
    });
    socket.current.on("new_room_created", (data) => {
      setNewConversation(data);
    });
    socket.current.on("close_room", (data) => {
      setRoomClosed(data);
    });
  }, []);

  useEffect(() => {
    if (newConversation) {
      user.isAdmin
        ? setActiveChatRooms((prev) => [...prev, newConversation])
        : newConversation.status === "new" &&
          setActiveChatRooms((prev) => [...prev, newConversation]);
    }
  }, [newConversation]);

  // Check if arrivalMessage belong to current chat
  useEffect(() => {
    if (
      arrivalMessage &&
      currentChat === arrivalMessage.roomId &&
      arrivalMessage.sender !== user._id &&
      messages.filter((m) => m._id === arrivalMessage._id).length < 1
    ) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    // If room closed exist in active room chat list
    const includedInActiveList =
      activeChatRooms.filter((room) => {
        return room._id === roomClosed;
      }).length > 0;

    if (includedInActiveList) {
      // then remove out of active list
      setActiveChatRooms((prev) => {
        return prev.filter((room) => {
          return room._id !== roomClosed;
        });
      });
      // and is currentChat
      if (currentChat && currentChat === roomClosed) {
        // notify
        alertify.set("notifier", "position", "bottom-left");
        alertify.success("Room Closed!");
        // and clear related state
        setCurrentChat(null);
        setMessages([]);
        setSendTo({ title: "", value: "" });
        setSelectedUser(null);
        setSearchText("");
        setReadOnly(false);
        fetchAllUsers();
      }
    }
  }, [roomClosed]);

  // Fetch all users
  useEffect(() => {
    fetchAllUsers();
  }, []);

  async function fetchAllUsers() {
    const response = await UserAPI.getStatusChat();
    setAllUsers(response);
    // Display all client users
    const otherUser = response
      .filter((value) => {
        return value._id !== user._id;
      })
      .map((u) => {
        return {
          label: u.fullname,
          id: u._id,
          role: u.role,
          status: u.status,
        };
      });
    setAnother(otherUser);
  }

  // Fetch active roomChat
  useEffect(() => {
    async function fetchActiveRoom() {
      const response = await ChatRoomsAPI.getActiveChatRooms();
      setActiveChatRooms(response);
    }
    fetchActiveRoom();
  }, []);

  // Fetch conversation when select chatRoom
  useEffect(() => {
    const fetchMessageData = async () => {
      const response = await ChatRoomsAPI.getMessageByRoomId(currentChat);
      if (response.error) {
        setCurrentChat(null);
        setMessages([]);
      } else if (response && response.status !== "closed") {
        setMessages(response.messages);
      }

      // Check Read only status
      if (
        sendTo.title === "toRoom" &&
        response.status === "open" &&
        response.members.indexOf(user._id) === -1
      ) {
        setReadOnly(true);
      } else setReadOnly(false);
    };

    currentChat && fetchMessageData();
  }, [currentChat]);

  // Handle send message
  const handlerSend = async () => {
    // Return when not select receiver or room chat
    if (!sendTo.value) {
      alertify.set("notifier", "position", "top-left");
      alertify.error("No Receiver Selected!");
      return;
    }

    // If room active but belong to Other
    if (readOnly) {
      alertify.set("notifier", "position", "top-left");
      alertify.error("Read Only, please!");
      return;
    }

    let roomId = currentChat;

    // If have no room chat yet, create new one
    if (sendTo.title === "toUser") {
      const newRoomData = await ChatRoomsAPI.createNewRoom({
        sender: user._id,
        receiver: sendTo.value,
      });
      roomId = newRoomData._id;
      setActiveChatRooms((prev) => [
        ...prev,
        {
          _id: roomId,
          members: newRoomData.members,
          status: newRoomData.status,
        },
      ]);
      setSendTo({ title: "toRoom", value: roomId });
      setCurrentChat(roomId);
    }

    // Add message to selected room chat
    const response = await ChatRoomsAPI.addMessage(roomId, {
      sender: user._id,
      text: textMessage,
    });

    response && textMessage.toLowerCase() === "/end"
      ? setMessages([])
      : setMessages(response.messages);
    setTextMessage("");
  };

  // Handle search user
  const handleSearch = (e, value) => {
    // When a user is selected,
    // check if currently having conversation with them
    if (value) {
      const id = value.id;
      setSelectedUser(value);

      const selectRoomChat = activeChatRooms.filter((room) => {
        return room.members.includes(id);
      })[0];
      // If not select userId and create new one
      if (!selectRoomChat) {
        setSendTo({ title: "toUser", value: id });
        setCurrentChat(null);
        setMessages([]);
        setSearchText("");
      } else {
        setSendTo({ title: "toRoom", value: selectRoomChat._id });
        setCurrentChat(selectRoomChat._id);
        setSearchText("");
      }
    }
  };

  //Handle select Room chat
  const handleSelected = (value) => {
    const id = value._id;
    setCurrentChat(id);
    setSearchText("");
    setSelectedUser(null);
    return setSendTo({ title: "toRoom", value: id });
  };

  // Check role
  const checkRole = (userId) => {
    const selectedUser = allUsers.filter((user) => {
      return user._id === userId;
    })[0];
    return selectedUser.role;
  };

  // Scroll to lastest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <div className="page-breadcrumb">
        <div className="row m-0 p-4">
          <div className="col-7 align-self-center p-0">
            <h4 className="page-title text-truncate text-dark font-weight-medium mb-1">
              Chat
            </h4>
            <div className="d-flex align-items-center">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent m-0 p-0">
                  <li
                    className="breadcrumb-item text-muted active"
                    aria-current="page"
                  >
                    Apps
                  </li>
                  <li
                    className="breadcrumb-item text-muted"
                    aria-current="page"
                  >
                    Chat
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Chat box field */}
      <div className=" chatContainer mx-4 ">
        <div className="row m-0 p-0">
          <div className="col-md-12 p-0 m-0">
            <div className="card border-0">
              <div className="row no-gutters">
                <div className="col-lg-3  border-right">
                  <div className="card-body border-bottom">
                    {/* Search user contact */}
                    <Autocomplete
                      loading
                      autoHighlight
                      sx={{ minWidth: 155 }}
                      value={selectedUser} //selected value
                      onChange={handleSearch}
                      inputValue={searchText} // input value
                      onInputChange={(e, value, reason) => {
                        if (reason === "clear") {
                          setSearchText("");
                          setSelectedUser(null);
                          setSendTo({ title: "", value: "" });
                          setMessages([]);
                          setCurrentChat(null);
                          return;
                        } else {
                          setSearchText(value);
                        }
                      }}
                      // disableClearable
                      options={another}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      getOptionDisabled={(option) => {
                        if (!user.isAdmin) {
                          return option.status === "busy";
                        }
                        return false;
                      }}
                      getOptionLabel={(option) => option.label}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          key={option.id}
                          sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                          {...props}
                        >
                          <img
                            width="30"
                            src="https://img.icons8.com/color/36/000000/administrator-male.png"
                            alt=""
                          />
                          <div>
                            <h6 className="message-title mb-0 mt-1">
                              {option.label}
                            </h6>

                            <span className="font-12 text-nowrap d-block text-muted text-truncate">
                              {option.status}
                            </span>
                          </div>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search Contact"
                          inputProps={{
                            ...params.inputProps,
                          }}
                        />
                      )}
                    />
                  </div>
                  {/* List of Active Room Chat */}
                  <div className="scrollable position-relative">
                    <ul className="mailbox list-style-none">
                      <li>
                        <div className="message-center">
                          {activeChatRooms?.length > 0 ? (
                            activeChatRooms.map((value) => (
                              <div
                                key={value._id}
                                onClick={() => handleSelected(value)}
                                className={`message-item d-flex align-items-center border-bottom px-3 py-2 active_user ${
                                  sendTo.value === value._id ? "selected" : ""
                                }`}
                              >
                                <div className="user-img">
                                  {" "}
                                  <img
                                    src="https://img.icons8.com/color/36/000000/administrator-male.png"
                                    alt="user"
                                    className="img-fluid rounded-circle"
                                    width="40px"
                                  />{" "}
                                  <span className="profile-status away float-right"></span>
                                </div>

                                <div className="w-75 d-inline-block v-middle pl-2">
                                  <span className="font-12 text-wrap d-block text-muted roomList">
                                    {value._id}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="d-none d-lg-block text-center text-muted p-3">
                              <h6>You have No Conversation right now!</h6>
                            </div>
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="border-bottom p-2 ">
                    <p>
                      <b>Send To:</b>{" "}
                      {sendTo.title && (
                        <span className="border rounded p-1 text-muted bg-light">
                          {sendTo.title === "toUser"
                            ? "User"
                            : sendTo.title === "toRoom"
                            ? "Room"
                            : ""}{" "}
                          {sendTo.value}
                        </span>
                      )}
                      {readOnly && sendTo.title === "toRoom" && (
                        <span className="rounded ml-1 p-1 text-dark bg-warning">
                          Read Only
                        </span>
                      )}
                    </p>
                  </div>
                  <div
                    className="chat-box position-relative"
                    style={{
                      height: "calc(100vh - 111px)",
                      overflowY: "scroll",
                    }}
                  >
                    <ul className="chat-list list-style-none px-3 pt-3">
                      {messages &&
                        messages.map((value) =>
                          value.sender === user._id ? (
                            <li
                              ref={scrollRef}
                              className="chat-item odd list-style-none mt-3 text-right"
                              key={value._id}
                            >
                              <div className="chat-content  d-inline-block pl-3">
                                <div className="box adminMsg p-2 d-inline-block mb-1">
                                  You: {value.text}
                                </div>
                                <br />
                              </div>
                            </li>
                          ) : (
                            <li
                              ref={scrollRef}
                              className="chat-item list-style-none mt-3"
                              key={value._id}
                            >
                              <div className="chat-img d-inline-block">
                                <img
                                  src="https://img.icons8.com/color/36/000000/administrator-male.png"
                                  alt="user"
                                  className="rounded-circle"
                                  width="45"
                                />
                              </div>
                              <div className="chat-content d-inline-block pl-3">
                                <div className="clientMsg p-2 d-inline-block mb-1">
                                  <span style={{ textTransform: "capitalize" }}>
                                    {checkRole(value.sender)}
                                  </span>
                                  : {value.text}
                                </div>
                              </div>
                              <div className="chat-time d-block font-10 mt-1 mr-0 mb-3"></div>
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                  <div className="card-body border-top">
                    <div className="row">
                      <div className="col-9 align-self-center">
                        <div className="input-field mt-0 mb-0">
                          <input
                            id="textarea1"
                            placeholder="Type and enter"
                            className="form-control border-0"
                            type="text"
                            onChange={(e) => setTextMessage(e.target.value)}
                            value={textMessage}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handlerSend();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-3">
                        <button
                          className="btn-circle btn-lg btn-primary float-right"
                          onClick={handlerSend}
                        >
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
