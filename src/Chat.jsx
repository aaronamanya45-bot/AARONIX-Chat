import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, AppBar, Toolbar, Avatar, TextField, List, ListItem, ListItemText, InputAdornment } from '@mui/material';
import { Logout, Send, Search } from '@mui/icons-material';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, where } from 'firebase/firestore';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Changed from searchEmail
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Generate a consistent chatId for two users
  const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

  // Search for users by username
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const q = query(collection(db, 'users'), where('username', '==', searchTerm.trim().toLowerCase()));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.uid !== auth.currentUser.uid);
      setSearchResults(users);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for messages in the selected chat
  useEffect(() => {
    if (!selectedUser) return;
    
    const chatId = getChatId(auth.currentUser.uid, selectedUser.uid);
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (message.trim() === '' || !selectedUser) return;

    const chatId = getChatId(auth.currentUser.uid, selectedUser.uid);

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: message,
        senderId: auth.currentUser?.uid,
        senderEmail: auth.currentUser?.email, // We still save email for security, but display username
        createdAt: serverTimestamp(),
      });
      setMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0f0f0f' }}>
      {/* Sidebar */}
      <Box sx={{ width: 320, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #333' }}>
          <Toolbar>
            <Typography variant="h6" color="primary" fontWeight="bold" sx={{ flexGrow: 1 }}>
              AARONIX Chat
            </Typography>
            <IconButton onClick={() => signOut(auth)} color="inherit"><Logout /></IconButton>
          </Toolbar>
        </AppBar>

        {/* Search Box */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', borderRadius: 2 } }}
          />
        </Box>
        
        <List sx={{ flex: 1, overflowY: 'auto' }}>
          {searchResults.length > 0 ? (
            searchResults.map(user => (
              <ListItem button key={user.id} onClick={() => setSelectedUser(user)} selected={selectedUser?.id === user.id}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>{user.username ? user.username[0].toUpperCase() : '?'}</Avatar>
                <ListItemText primary={user.username || 'Unknown'} secondary={user.email} />
              </ListItem>
            ))
          ) : (
            <Typography align="center" color="text.secondary" mt={4}>Search for a username to start a chat</Typography>
          )}
        </List>
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #333' }}>
          <Toolbar>
            {selectedUser ? (
              <>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>{selectedUser.username ? selectedUser.username[0].toUpperCase() : '?'}</Avatar>
                <Typography variant="h6">{selectedUser.username || selectedUser.email}</Typography>
              </>
            ) : (
              <Typography variant="h6" color="text.secondary">Select a chat</Typography>
            )}
          </Toolbar>
        </AppBar>

        {/* Messages */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {!selectedUser && (
            <Typography align="center" color="text.secondary" mt={4}>Search for a user to start messaging</Typography>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === auth.currentUser?.uid;
            // Use the selected user's username for their messages, and current user's email for yours
            // (You could save username in message, but this is fine for now)
            return (
              <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ bgcolor: isMe ? '#005c4b' : '#202c33', p: 1.5, borderRadius: 2, maxWidth: '70%' }}>
                  <Typography variant="caption" color="primary.main" display="block">
                    {isMe ? 'You' : selectedUser.username}
                  </Typography>
                  <Typography variant="body1">{msg.text}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Message Input */}
        <Box component="form" onSubmit={handleSend} sx={{ p: 2, borderTop: '1px solid #333', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={selectedUser ? "Type a message..." : "Select a user first"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!selectedUser}
            autoComplete="off"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', borderRadius: 2 } }}
          />
          <IconButton type="submit" color="primary" disabled={!selectedUser}><Send /></IconButton>
        </Box>
      </Box>
    </Box>
  );
}// Real-time Chat Component
