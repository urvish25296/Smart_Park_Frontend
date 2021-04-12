import React, { useState } from "react";
import { Redirect } from "react-router-dom";

import { LockOutlined as LockOutlinedIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import {
  DialogTitle,
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://codehiking.com/">
        CodeHiking
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  forlink: {
    cursor: "pointer",
  },
}));

const GET_TOKEN = gql`
  mutation GetToken($email: String!, $password: String!) {
    getToken(email: $email, password: $password) {
      user {
        id
        first_name
        last_name
        email
        phone_number
        is_admin
        status
      }
      token
      message
      error
    }
  }
`;

export default function Login() {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirect, setRedirect] = useState(
    localStorage.getItem("token") ? <Redirect to="/main" /> : null
  );

  const [getToken] = useMutation(GET_TOKEN);

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function handleReset() {
    return formIsValid() ? handleClose() : null;
    //reset password code
  }

  function formIsValid(email, password) {
    let msg = "";
    if (
      !email
        .toString()
        .match(
          /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        )
    ) {
      msg += "Email is invalid, Please try Again !";
    }

    if (msg !== "") {
      return false;
    } else return true;
  }

  const login = async () => {
    if (!formIsValid(email, password)) {
      setErrorMessage("Invalid Email.");
      setSuccessMessage("");
      return;
    }
    try {
      const { data } = await getToken({
        variables: {
          email,
          password,
        },
      });
      var response = data.getToken;
    } catch (ex) {
      setErrorMessage("Internal Server Error.");
      setSuccessMessage("");
      return;
    }

    if (response.error) {
      setErrorMessage(response.error);
      return;
    }

    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setSuccessMessage("Logged In successfully.");
    setErrorMessage("");

    setTimeout(() => {
      setRedirect(<Redirect to="/main" />);
    }, 1000);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      {redirect}

      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Log in
        </Typography>

        {errorMessage && (
          <Alert className={classes.margin} severity="error">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert className={classes.margin} severity="success">
            {successMessage}
          </Alert>
        )}

        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            value={email}
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            value={password}
            label="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={(ev) => {
              ev.preventDefault();
              login();
            }}
            className={classes.submit}
          >
            Log In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link className={classes.forlink} onClick={handleClickOpen}>
                Forgot password ?
              </Link>
            </Grid>
          </Grid>
        </form>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Are you sure you want to reset passoword.?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please enter your email address. Please Follow the instructions
              sent in the email
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="resetEmail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              label="Email Address"
              type="email"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleReset} color="primary" autoFocus>
              Send Link
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
