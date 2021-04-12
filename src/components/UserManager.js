import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Switch,
  Backdrop,
} from "@material-ui/core";
import { Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";

import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 10,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  table: {
    minWidth: 650,
    alignItems: "center",
  },
  margin: {
    margin: theme.spacing(1),
  },
  backdrop: {
    zIndex: 9999,
    color: "#fff",
  },
}));

const GET_USER = gql`
  query {
    getUsers(userInput: {}) {
      obj {
        id
        first_name
        last_name
        email
        password
        phone_number
        is_admin
        status
      }
      message
      error
    }
  }
`;

const ADD_USER = gql`
  mutation CreateUser(
    $first_name: String!
    $last_name: String!
    $email: String!
    $password: String!
    $phone_number: String!
    $is_admin: Boolean!
    $status: Boolean!
  ) {
    createUser(
      userInput: {
        first_name: $first_name
        last_name: $last_name
        email: $email
        password: $password
        phone_number: $phone_number
        is_admin: $is_admin
        status: $status
      }
    ) {
      obj {
        first_name
        last_name
        email
        password
        phone_number
        is_admin
        status
      }
      message
      error
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $first_name: String!
    $last_name: String!
    $email: String!
    $password: String!
    $phone_number: String!
    $is_admin: Boolean!
    $status: Boolean!
  ) {
    updateUser(
      userInput: {
        id: $id
        first_name: $first_name
        last_name: $last_name
        email: $email
        password: $password
        phone_number: $phone_number
        is_admin: $is_admin
        status: $status
      }
    ) {
      obj {
        first_name
        last_name
        email
        password
        phone_number
        is_admin
        status
      }
      message
      error
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(userInput: { id: $id }) {
      obj {
        first_name
        last_name
        email
        password
        phone_number
        is_admin
        status
      }
      message
      error
    }
  }
`;

export default function UserManager() {
  const classes = useStyles();

  const { loading, error, data, refetch } = useQuery(GET_USER);
  const [addUser] = useMutation(ADD_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit
  const [dimmer, setDimmer] = useState(false);

  // form fields
  const [hiddenIDField, setHiddenIDField] = useState("");
  const [firstNameField, setFirstNameField] = useState("");
  const [lastNameField, setLastNameField] = useState("");
  const [emailField, setEmailField] = useState("");
  const [passwordField, setPasswordField] = useState("");
  const [phoneNumberField, setPhoneNumberField] = useState("");
  const [isAdminField, setIsAdminField] = useState(false);
  const [statusField, setStatusField] = useState(false);

  const setAddModal = () => {
    setModalOpen(true);
    setModalType("add");
    setHiddenIDField("");
    setFirstNameField("");
    setLastNameField("");
    setEmailField("");
    setPasswordField("");
    setPhoneNumberField("");
    setIsAdminField(false);
    setStatusField(false);
  };

  let errorMessage = null;
  if (error)
    errorMessage =
      "An error occurred while fetching Users. Please try again later.";
  if (data && data.getUsers.error) errorMessage = data.getUsers.message;

  return (
    <>
      <Backdrop className={classes.backdrop} open={dimmer} onClick={() => {}}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <NavBar
        setAddModal={setAddModal}
        refreshPage={() => {
          refetch();
        }}
      />
      {errorMessage && (
        <Alert className={classes.margin} severity="error">
          {errorMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              <TableCell align="center">First Name</TableCell>
              <TableCell align="center">Last Name</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Phone Number</TableCell>
              <TableCell align="center">Is Admin</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}

            {data &&
              data.getUsers.obj.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell component="th" scope="row">
                      {item.first_name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.last_name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.email}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.phone_number}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.is_admin ? "Yes" : "No"}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.status ? "Yes" : "No"}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <IconButton
                        aria-label="edit"
                        className={classes.margin}
                        onClick={(ev) => {
                          setModalOpen(true);
                          setModalType("edit");
                          setHiddenIDField(item.id);
                          setFirstNameField(item.first_name);
                          setLastNameField(item.last_name);
                          setEmailField(item.email);
                          setPasswordField("");
                          setPhoneNumberField(item.phone_number);
                          setIsAdminField(item.is_admin);
                          setStatusField(item.status);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        className={classes.margin}
                        onClick={() => {
                          setDimmer(true);
                          deleteUser({
                            variables: {
                              id: item.id,
                            },
                          }).then((response) => {
                            setTimeout(() => {
                              refetch();
                              setDimmer(false);
                            }, 1000);
                          });
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {modalType === "add" ? "Add Form" : "Edit Form"}
        </DialogTitle>
        <DialogContent>
          <input hidden value={hiddenIDField}></input>

          <TextField
            margin="dense"
            value={firstNameField}
            onChange={(e) => {
              setFirstNameField(e.target.value);
            }}
            label="First Name"
            fullWidth
          />

          <TextField
            margin="dense"
            value={lastNameField}
            onChange={(e) => {
              setLastNameField(e.target.value);
            }}
            label="Last Name"
            fullWidth
          />

          <TextField
            margin="dense"
            value={emailField}
            onChange={(e) => {
              setEmailField(e.target.value);
            }}
            label="Email"
            type="email"
            fullWidth
          />

          <TextField
            margin="dense"
            value={passwordField}
            onChange={(e) => {
              setPasswordField(e.target.value);
            }}
            label="Password"
            type="password"
            fullWidth
          />

          <TextField
            margin="dense"
            value={phoneNumberField}
            onChange={(e) => {
              setPhoneNumberField(e.target.value);
            }}
            label="Phone Number"
            fullWidth
          />

          <FormGroup aria-label="position" row>
            <FormControlLabel
              value="top"
              control={
                <Switch
                  color="primary"
                  checked={isAdminField}
                  onChange={() => {
                    setIsAdminField(!isAdminField);
                  }}
                />
              }
              label="Is Admin"
              labelPlacement="top"
            />
            <FormControlLabel
              value="top"
              control={
                <Switch
                  color="primary"
                  checked={statusField}
                  onChange={() => {
                    setStatusField(!statusField);
                  }}
                />
              }
              label="Status"
              labelPlacement="top"
            />
          </FormGroup>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setModalOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (modalType === "add") {
                setDimmer(true);
                addUser({
                  variables: {
                    first_name: firstNameField,
                    last_name: lastNameField,
                    email: emailField,
                    password: passwordField,
                    phone_number: phoneNumberField,
                    is_admin: isAdminField,
                    status: statusField,
                  },
                }).then(() => {
                  setTimeout(() => {
                    refetch();
                    setDimmer(false);
                  }, 1000);
                });
              }

              if (modalType === "edit") {
                setDimmer(true);
                updateUser({
                  variables: {
                    id: hiddenIDField,
                    first_name: firstNameField,
                    last_name: lastNameField,
                    email: emailField,
                    password: passwordField,
                    phone_number: phoneNumberField,
                    is_admin: isAdminField,
                    status: statusField,
                  },
                }).then(() => {
                  setTimeout(() => {
                    refetch();
                    setDimmer(false);
                  }, 1000);
                });
              }

              setModalOpen(false);
            }}
            color="primary"
            autoFocus
          >
            {modalType === "add" ? "Add" : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function NavBar({ setAddModal, refreshPage }) {
  const classes = useStyles();

  return (
    <>
      <AppBar position="static" className={classes.root}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          ></IconButton>
          <Typography variant="h6" className={classes.title}>
            User Manager
          </Typography>
          <Button color="inherit" onClick={refreshPage}>
            Refresh
          </Button>
          <Button color="inherit" onClick={setAddModal}>
            Add User
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
}
