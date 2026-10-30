
import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // New state for username
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        if (!username.trim()) {
          setError('Username is required');
          return;
        }
        
        // Check if username is already taken
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Save user to Firestore with username
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email.toLowerCase(),
          username: username.trim().toLowerCase(), // Store username in lowercase for easy search
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f0f0f' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, bgcolor: '#1a1a1a', borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" align="center" gutterBottom>
          AARONIX Chat
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mb={3}>
          {isRegister ? 'Create a new account' : 'Welcome back'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <TextField 
              fullWidth 
              label="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              margin="normal" 
              required 
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a' } }} 
            />
          )}
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a' } }} />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a' } }} />
          
          {error && <Typography color="error" variant="body2" mt={2}>{error}</Typography>}
          
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }}>
            {isRegister ? 'Sign Up' : 'Login'}
          </Button>
          
          <Button fullWidth onClick={() => setIsRegister(!isRegister)} sx={{ textTransform: 'none' }}>
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}// Authentication Component
