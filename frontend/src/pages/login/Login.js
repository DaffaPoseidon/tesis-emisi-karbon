import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'

const defaultTheme = createTheme()

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await fetch(`http://localhost:5000/auth/login`, {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // const result = await response.json();
      const result = await response.json();

      if (response.ok) {
        if (result.user && result.user._id) {
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('token', result.token);
          navigate('/dashboard');
        } else {
          console.error('Login failed, user data not found');
        }
      } else {
        console.error('Login failed:', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };

  const handleHomeClick = () => {
    navigate("/")
  }

  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              {/* <LockOutlinedIcon /> */}
            </Avatar>
            <Typography component="h1" variant="h5">
              Log in
            </Typography>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button
                type="subit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit}
              >
                Log In
              </Button>
              {/* <Grid container>
                <Grid item>
                  <Link variant="body2" onClick={handleSignUpClick}>
                    Don't have an account? Sign Up
                  </Link>
                </Grid>
              </Grid> */}
            </Box>
          </Box>
          <Grid item>

            <Link
              variant="body2"
              onClick={handleHomeClick}
              className="cursor-pointer"
              sx={{ display: 'block', textAlign: 'center' }}
            >
              Kembali ke beranda
            </Link>
          </Grid>
        </Container>
      </ThemeProvider >
    </>
  )
}

export default Login