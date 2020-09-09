import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Chat from './Chat';
import Pusher from 'pusher-js';
import axios from "./axios";
import { ChevronLeftOutlined } from '@material-ui/icons';
// import { ContactSupportOutlined } from '@material-ui/icons';

function App() {

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get('./messages/sync')
      .then(response => {

        setMessages(response.data)
      })
  }, [])

  useEffect(() => {
    const pusher = new Pusher('19540d82bde150d7b8fa', {
      cluster: 'us2'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', (newMessage) => {
      alert(JSON.stringify(newMessage));
      setMessages([...messages, newMessage])
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    }

  }, [messages])

  console.log(messages)

  return (
    <div className="app">

      <div className="app__body">
        <Sidebar />
        <Chat />
      </div>
    </div>
  );
}

export default App;
