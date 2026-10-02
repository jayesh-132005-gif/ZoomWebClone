import { useState } from "react";
import { useContext } from "react";
import AuthContext from "../contexts/authContext.jsx";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import "../App.css";

export default function Register() {

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");


  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [registerError, setRegisterError] = useState("");


  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");

  const validateInputs = (name, username, password) => {
    let isValid = true;

    // Name validation
    if (!name || !/^[A-Za-z ]+$/.test(name)) {
      setNameError(true);
      setNameErrorMessage("Please enter a valid name.");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    // Username validation
    if (!username || !/^[A-Za-z0-9_]+$/.test(username)) {
      setUsernameError(true);
      setUsernameErrorMessage("Please enter a valid username.");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }


    // Password validation
    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Password must be at least 6 characters long."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;


  };


  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = validateInputs(name, username, password);
    if (!isValid) {
      return;
    }

    // Call the register function from the context
    const result = await register(name, username, password);
    if (result.success) {
      navigate("/auth");
    } else {

      // Handle registration error
      setRegisterError(result.error.message);

    }
  };



  return (
    <>
      <CssBaseline />

      <Stack
        className="authentication-page"
        alignItems="center"
        justifyContent="center"
      >
        <Card className="authentication-card" variant="outlined">
          <Typography
            component="h1"
            variant="h5"
            className="authentication-heading"
          >
            Sign Up
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            className="authentication-form"
          >

            <FormControl fullWidth className="authentication-field">
              <FormLabel htmlFor="name">Name</FormLabel>

              <TextField
                size="small"
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                fullWidth
                error={nameError}
                helperText={nameErrorMessage}
              />
            </FormControl>


            <FormControl fullWidth className="authentication-field">
              <FormLabel htmlFor="username">Username  </FormLabel>

              <TextField
                size="small"
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => { 
                  setUsername(e.target.value);
                  setRegisterError("");
                }}
                placeholder="your_username"
                autoComplete="username"
                autoFocus
                required
                fullWidth
                error={usernameError}
                helperText={usernameErrorMessage}
              />
            </FormControl>

            <FormControl fullWidth className="authentication-field">
              <FormLabel htmlFor="password">Password</FormLabel>

              <TextField
                size="small"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                required
                fullWidth
                error={passwordError}
                helperText={passwordErrorMessage}
              />
            </FormControl>

           
            {registerError && (
              <Typography color="error">
                {registerError}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="sign-in-button"
            >
              Sign up
            </Button>


          </Box>

          <Divider className="authentication-divider">or</Divider>

          <Typography
            variant="body2"
            className="create-account-text"
          >
            Already have an account?{" "}
            <Link href="/auth">Sign In</Link>
          </Typography>
        </Card>
      </Stack>
    </>
  );
}