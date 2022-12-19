import React, { useEffect, useState, useContext, useRef } from "react";
import alertify from "alertifyjs";

import ChatRoomsAPI from "../../API/ChatRoomsAPI";
import { AuthContext } from "../../context/AuthContext";
import "./Chat.css";

import io from "socket.io-client";

function Chat(props) {
  const { user } = useContext(AuthContext);
  const [toggleChatBox, setToggleChatBox] = useState(false);
  const [arrivalMessage, setArrivalMessage] = useState(null); //Arrive msg from socket key receive_message;
  const [newRoom, setNewRoom] = useState(null);
  const [roomClosed, setRoomClosed] = useState(null);
  const [textMessage, setTextMessage] = useState(""); //Imput text
  const [messages, setMessages] = useState([]); //Messages array of current chat
  const [currentChat, setCurrentChat] = useState(
    JSON.parse(localStorage.getItem("roomChat")) || null
  ); //Current room chat ID

  const socket = useRef();
  const scrollRef = useRef();

  // Receive socket key receive_message from server
  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SERVER_URL);
    socket.current.on("receive_message", (data) => {
      setArrivalMessage(data);
    });
    socket.current.on("join_room", (data) => {
      setNewRoom(data);
    });
    socket.current.on("close_room", (data) => {
      setRoomClosed(data);
    });
  }, []);

  useEffect(() => {
    if (!currentChat && newRoom && newRoom.receiver === user._id) {
      setCurrentChat(newRoom.roomId);
      localStorage.setItem("roomChat", JSON.stringify(newRoom.roomId));
      setToggleChatBox(true);
    }
  }, [newRoom]);

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
    // If currentChat closed then clear roomId
    if (currentChat && currentChat === roomClosed) {
      alertify.set("notifier", "position", "bottom-left");
      alertify.success("Room Closed!");
      setMessages([]);
      setCurrentChat(null);
      setToggleChatBox(false);
      localStorage.removeItem("roomChat");
    }
  }, [roomClosed]);

  // Load message when change room chat
  useEffect(() => {
    async function fetchData() {
      // If have room chat infor in localstorage
      const response = currentChat
        ? await ChatRoomsAPI.getMessageByRoomId(currentChat)
        : await ChatRoomsAPI.getMessageByUserId(user._id);

      if (response.error) {
        setCurrentChat(null);
        localStorage.removeItem("roomChat");
        setMessages([]);
      }

      if (response._id && response.status !== "closed") {
        localStorage.setItem("roomChat", JSON.stringify(response._id));
        setCurrentChat(response._id);
        setMessages(response.messages);
      }
    }
    toggleChatBox && fetchData();
  }, [currentChat, user, toggleChatBox]);

  // Handle send message
  const handlerSend = async () => {
    let roomId = currentChat;

    if (!currentChat) {
      // If have no room chat create new one
      const newRoomData = await ChatRoomsAPI.createNewRoom({
        sender: user._id,
      });
      roomId = newRoomData._id;
      setCurrentChat(roomId);
      localStorage.setItem("roomChat", JSON.stringify(roomId));
    }

    // Post new message and save to database
    const response = await ChatRoomsAPI.addMessage(roomId, {
      sender: user._id,
      text: textMessage,
    });
    response && textMessage.toLowerCase() === "/end"
      ? setMessages([])
      : setMessages(response.messages);
    setTextMessage("");
  };

  // Handle toggle chat box
  const onChat = () => {
    setToggleChatBox(!toggleChatBox);
  };

  // Handle onChange input mesage
  const onChangeText = (e) => {
    setTextMessage(e.target.value);
  };

  // Scroll to the lastest mesage
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="wrapper_chat">
      <div className="chat_messenger" onClick={onChat}>
        <svg x="0" y="0" width="60px" height="60px">
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g>
              <circle fill="#383838" cx="30" cy="30" r="30"></circle>
              <svg x="10" y="10">
                <g transform="translate(0.000000, -10.000000)" fill="#FFFFFF">
                  <g id="logo" transform="translate(0.000000, 10.000000)">
                    <path
                      d="M20,0 C31.2666,0 40,8.2528 40,19.4 C40,30.5472 31.2666,38.8 
								20,38.8 C17.9763,38.8 16.0348,38.5327 14.2106,38.0311 C13.856,37.9335 13.4789,37.9612 
								13.1424,38.1098 L9.1727,39.8621 C8.1343,40.3205 6.9621,39.5819 6.9273,38.4474 L6.8184,34.8894 
								C6.805,34.4513 6.6078,34.0414 6.2811,33.7492 C2.3896,30.2691 0,25.2307 0,19.4 C0,8.2528 8.7334,0 
								20,0 Z M7.99009,25.07344 C7.42629,25.96794 8.52579,26.97594 9.36809,26.33674 L15.67879,21.54734 
								C16.10569,21.22334 16.69559,21.22164 17.12429,21.54314 L21.79709,25.04774 C23.19919,26.09944 
								25.20039,25.73014 26.13499,24.24744 L32.00999,14.92654 C32.57369,14.03204 31.47419,13.02404 
								30.63189,13.66324 L24.32119,18.45264 C23.89429,18.77664 23.30439,18.77834 22.87569,18.45674 
								L18.20299,14.95224 C16.80079,13.90064 14.79959,14.26984 13.86509,15.75264 L7.99009,25.07344 Z"
                    ></path>
                  </g>
                </g>
              </svg>
            </g>
          </g>
        </svg>
      </div>

      {toggleChatBox && (
        <div className="active_chat animate__animated animate__jackInTheBox">
          <div style={{ width: "100%" }}>
            <div
              className="card card-bordered fix_boderChat"
              style={{ width: "fit-content" }}
            >
              <div className="card-header">
                <h4 className="card-title">
                  <strong>Customer Support</strong>
                </h4>{" "}
                <button className="btn btn-xs btn-secondary">
                  Let's Chat App
                </button>
              </div>
              <div className="ps-container ps-theme-default ps-active-y fix_scoll">
                {messages &&
                  messages.map((value) =>
                    value.sender === user._id ? (
                      <div
                        ref={scrollRef}
                        className="media media-chat media-chat-reverse"
                        key={value._id}
                      >
                        <div className="media-body">
                          <p>You: {value.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        ref={scrollRef}
                        className="media media-chat"
                        key={value._id}
                      >
                        {" "}
                        <img
                          className="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt=""
                        />
                        <div className="media-body" key={value._id}>
                          <p>Cộng tác viên: {value.text}</p>
                        </div>
                      </div>
                    )
                  )}
              </div>
              <div className="publisher bt-1 border-light">
                <img
                  className="avatar avatar-xs"
                  src="https://img.icons8.com/color/36/000000/administrator-male.png"
                  alt=""
                />
                <input
                  type="text"
                  placeholder="Enter Message!"
                  onChange={onChangeText}
                  value={textMessage}
                  style={{ width: "80%" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlerSend();
                    }
                  }}
                />
                <button
                  onClick={handlerSend}
                  className="publisher-btn text-info"
                  data-abc="true"
                >
                  <i className="fa fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
