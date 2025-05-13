import React, { useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  MessageList,
  MessageInput,
  useChatContext,
  useMessageContext,
  Thread,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { Sidebar, Menu, MenuItem, useProSidebar } from 'react-pro-sidebar';
import './index.css';



const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const customTheme = {
  '--str-chat-background': '#000000',
  '--str-chat-channel-background': '#000000',
  '--str-chat__main-panel-background-color': '#000000',
  '--str-chat-primary-color': '#ff0000',
  '--str-chat-text-color': '#ffffff',
  '--str-chat-message-text-color': '#ffffff',
  '--str-chat-message-background': '#181818',
  '--str-chat-message-background-hover': '#222',
  '--str-chat-input-background': '#181818',
  '--str-chat-input-text-color': '#ffffff',
  '--str-chat-button-primary-background': '#ff0000',
  '--str-chat-button-primary-color': '#ffffff',
  '--str-chat-scrollbar-thumb': '#ff0000',
  '--str-chat-scrollbar-track': '#333333',
  '--str-chat-user-message-background': '#181818',
  '--str-chat-other-message-background': '#181818',
  '--str-chat-header-background': '#181818',
  '--str-chat-header-title-color': '#ff0000',
};

function CustomMessage() {
  const { message } = useMessageContext();
  if (!message || typeof message.text !== 'string') return null;

  let dateString = '';
  if (message.created_at) {
    const date = new Date(message.created_at);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    dateString = formatter.format(date);
  }

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 8,
        marginBottom: 8,
        maxWidth: '80%',
        wordBreak: 'break-word',
      }}
    >
      <div style={{ fontWeight: 'bold', color: '#ff0000', marginBottom: 4 }}>
        {message.user?.name || message.user?.id || 'Unknown'}
        {dateString && (
          <span
            style={{
              color: '#aaa',
              fontWeight: 'normal',
              fontSize: '0.60em',
              marginLeft: 10,
            }}
          >
            {dateString}
          </span>
        )}
      </div>
      <div>{message.text}</div>
    </div>
  );
}

function ActiveChannelUserList() {
  const { channel } = useChatContext();
  const members = channel?.state?.members || {};
  const seen = new Set();
  const uniqueOnlineMembers = [];

  for (const member of Object.values(members)) {
    const user = member.user;
    if (!user?.online) continue;
    const key = user.id || user.name || 'unknown';
    if (!seen.has(key)) {
      seen.add(key);
      uniqueOnlineMembers.push(member);
    }
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {uniqueOnlineMembers.length === 0 && (
        <li style={{ color: '#888', fontStyle: 'italic', padding: 0, margin: 0 }}>
          No users online
        </li>
      )}
      {uniqueOnlineMembers.map((member) => (
        <li
          key={member.user?.id || member.user?.name || Math.random()}
          style={{
            color: '#fff',
            padding: '4px 0',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          {member.user?.name || member.user?.id || 'Unknown'}
        </li>
      ))}
    </ul>
  );
}

function ChannelTitle() {
  const { channel } = useChatContext();
  return (
    <div
      style={{
        color: '#ff0000',
        fontWeight: 'bold',
        fontSize: '1.4rem',
        padding: '16px',
        borderBottom: '2px solid #ff0000',
        background: '#181818',
        minHeight: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        textAlign: 'center',
      }}
    >
      <span style={{ width: '100%' }}>
        {channel?.data?.name || channel?.id || 'Select a Channel'}
      </span>
    </div>
  );
}

function CustomChannelPreview({ channel, setActiveChannel, activeChannel }) {
  const isActive = channel?.id === activeChannel?.id;
  return (
    <div
      onClick={() => setActiveChannel(channel)}
      style={{
        padding: '10px 16px',
        cursor: 'pointer',
        color: isActive ? '#ff0000' : '#fff',
        background: 'transparent',
        fontWeight: isActive ? 'bold' : 'normal',
        borderLeft: isActive ? '4px solid #ff0000' : '4px solid transparent',
        borderRadius: 0,
      }}
    >
      {channel.data.name || channel.id}
    </div>
  );
}

function CustomChannelList({ children }) {
  return <div>{children}</div>;
}

function ChatLayout({ chatClient, handleLogout }) {
  const { toggled, toggleSidebar, broken } = useProSidebar();

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        background: '#000',
        color: '#fff',
        display: 'flex',
      }}
    >
      {/* Hamburger only on mobile */}
      {broken && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 2000,
            background: '#ff0000',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            fontSize: 24,
            cursor: 'pointer',
          }}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      )}
      <Sidebar
        breakPoint="md"
        toggled={toggled}
        onBackdropClick={toggleSidebar}
        style={{
          minWidth: 250,
          background: '#181818',
          color: '#fff',
          position: broken ? 'fixed' : 'relative',
          height: '100vh',
          zIndex: 1500,
        }}
      >
        <Menu>
          {/* Channels label */}
          <MenuItem
            disabled
            style={{
              color: '#ff0000',
              fontWeight: 'bold',
              margin: 0,
              padding: 0,
            }}
          >
            Channels
          </MenuItem>
          {/* Channel list */}
          <MenuItem style={{ margin: 0, padding: 0 }}>
            <ChannelList
              filters={{ members: { $in: [chatClient.userID] } }}
              sort={{ last_message_at: -1 }}
              options={{ state: true, watch: true, presence: true }}
              List={CustomChannelList}
              Preview={(props) => (
                <CustomChannelPreview
                  {...props}
                  setActiveChannel={props.setActiveChannel}
                  activeChannel={props.activeChannel}
                />
              )}
            />
          </MenuItem>
          {/* Online Users label with marginTop for gap */}
          <MenuItem
            disabled
            style={{
              color: '#ff0000',
              fontWeight: 'bold',
              margin: 0,
              padding: 0,
              marginTop: 100,
              display: 'block',
            }}
          >
            <div style={{ margin: 0, padding: 0 }}>
              <div style={{ margin: 0, padding: 0 }}>Online Users</div>
              <ActiveChannelUserList />
            </div>
          </MenuItem>
          {/* Log Out at bottom */}
          <MenuItem
            onClick={handleLogout}
            style={{
              color: '#ff0000',
              fontWeight: 'bold',
              padding: '16px',
              marginTop: 'auto',
            }}
          >
            Log Out
          </MenuItem>
        </Menu>
      </Sidebar>
      <main
        style={{
          flex: 1,
          background: '#000',
          color: '#fff',
          padding: 20,
          marginLeft: broken ? 0 : 250, // leave space for sidebar on desktop
          transition: 'margin 0.3s',
          overflowY: 'auto',
        }}
      >
        <Channel>
          <Window>
            <ChannelTitle />
            <MessageList Message={CustomMessage} />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </main>
    </div>
  );
}

function App() {
  const [chatClient, setChatClient] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

const verifyPin = async () => {
  setIsLoading(true);
  setError('');
  try {
    fetch('https://chat-backend-lwq1.onrender.com/verify-pin', { method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Verification failed');
    setResult(data);

    // Initialize Stream Chat client with the token from backend
    const client = StreamChat.getInstance(apiKey);
    await client.connectUser(
      { id: data.userId, name: data.name },
      data.token
    );
    setChatClient(client);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};


  const handleLogout = async () => {
    if (chatClient) await chatClient.disconnectUser();
    setChatClient(null);
    setResult(null);
    setPin('');
  };

  if (chatClient) {
    return (
      <div style={customTheme}>
        <Chat client={chatClient}>
          <ChatLayout chatClient={chatClient} handleLogout={handleLogout} />
        </Chat>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
      }}
    >
      <div
        style={{
          background: '#000',
          border: '1px solid #ff0000',
          borderRadius: 8,
          padding: 40,
          boxShadow: '0 4px 12px rgba(255,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '90vw',
          maxWidth: 350,
        }}
      >
        <h2 style={{ color: '#ff0000', marginBottom: 24 }}>Enter PIN</h2>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter your PIN"
          style={{
            marginBottom: 16,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ff0000',
            backgroundColor: '#000',
            color: '#fff',
            width: '100%',
            fontSize: '1rem',
          }}
        />
        <button
          onClick={verifyPin}
          disabled={isLoading}
          style={{
            backgroundColor: '#ff0000',
            color: '#fff',
            border: 'none',
            padding: '10px 0',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '1rem',
            fontWeight: 'bold',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
        {error && <div style={{ color: '#ff0000', marginTop: 20 }}>{error}</div>}
        {result && (
          <div style={{ marginTop: 20, color: '#fff' }}>
            <b>Welcome, {result.name}!</b>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap your app with ProSidebarProvider at the root (e.g. in index.js)
export default App;
