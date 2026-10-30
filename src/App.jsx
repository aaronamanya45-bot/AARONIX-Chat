import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import Chat from './Chat';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f5c518' },
  },
});

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {user ? <Chat /> : <Login />}
    </ThemeProvider>
  );
}// App Router and Theme Provider
