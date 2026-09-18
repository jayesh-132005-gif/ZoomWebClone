import { useState } from "react";

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

export default function Authentication() {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const validateInputs = (email, password) => {
    let isValid = true;

    // Email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
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


  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email");
    const password = formData.get("password");
    const remember = formData.get("remember");

    const isValid = validateInputs(email, password);

    if (!isValid) {
      return;
    }

    console.log({
      email,
      password,
      remember: Boolean(remember),
    });

    // Baad mein yahan backend login API call karenge.
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
              <FormLabel htmlFor="email">Email</FormLabel>

              <TextField
                size="small"
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                error={emailError}
                helperText={emailErrorMessage}
              />
            </FormControl>

            <FormControl fullWidth className="authentication-field">
              <FormLabel htmlFor="password">Password</FormLabel>

              <TextField
                size="small"
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
                autoComplete="current-password"
                required
                fullWidth
                error={passwordError}
                helperText={passwordErrorMessage}
              />
            </FormControl>

            <FormControlLabel
              className="remember-me"
              control={
                <Checkbox
                  size="small"
                  name="remember"
                  value="true"
                  color="primary"
                />
              }
              label="Remember me"
            />

            <Button
              type="button"
              fullWidth
              variant="contained"
              className="sign-in-button"
            >
              Sign in
            </Button>
             
            {/* <Link
              component="button"
              type="button"
              variant="body2"
              className="forgot-password"
              onClick={() => alert("Forgot password clicked")}
            >
              Forgot your password?
            </Link> */}


          </Box>

          <Divider className="authentication-divider">or</Divider>

          {/* <Button
            size="small"
            fullWidth
            variant="outlined"
            className="social-button"
            onClick={() => alert("Google sign in clicked")}
          >
            Sign in with Google
          </Button> */}

          {/* <Button
            size="small"
            fullWidth
            variant="outlined"
            className="social-button"
            onClick={() => alert("Facebook sign in clicked")}
          >
            Sign in with Facebook
          </Button> */}

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