import { useContext, useState } from "react";
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

import "../styles/authentication.css";

export default function Authentication() {

  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loginError, setLoginError] = useState("");

  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");


  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const validateInputs = (username, password) => {
    let isValid = true;

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


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");

    const isValid = validateInputs(username, password);

    if (!isValid) {
      return;
    }

    const result = await login(username, password);
    if (!result.success) {
      setLoginError(
        result.error?.message || "Login failed. Please try again."
      );
      return;
    }

    // Login successful — next step mein redirect karenge
    navigate("/home");

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
            Sign In
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            className="authentication-form"
          >
            <FormControl fullWidth className="authentication-field">
              <FormLabel htmlFor="username">Username</FormLabel>

              <TextField
                size="small"
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

            {loginError && (
              <Typography color="error" variant="body2">
                {loginError}
              </Typography>
            )}

            <FormControlLabel
              className="remember-me"
              control={
                <Checkbox
                  size="small"
                  name="remember"
                  value="true"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="sign-in-button"
            >
              Sign in
            </Button>


          </Box>

          <Divider className="authentication-divider">or</Divider>

          <Typography
            variant="body2"
            className="create-account-text"
          >
            Don&apos;t have an account?{" "}
            <Link href="/register">Sign up</Link>
          </Typography>
        </Card>
      </Stack>
    </>
  );
}