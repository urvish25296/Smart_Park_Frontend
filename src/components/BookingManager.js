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
  Slider,
  Backdrop,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

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
  noSideMargin: {
    marginLeft: 0,
    marginRight: 0,
  },
}));

const GET_BOOKING = gql`
  query {
    getBookings(bookingInput: {}) {
      obj {
        id
        user {
          id
          first_name
          last_name
        }
        parkingspot {
          id
          name
        }
        date
        num_of_hours
        total
        is_paid
      }
      message
      error
    }
  }
`;

const ADD_BOOKING = gql`
  mutation CreateBooking(
    $user: ID!
    $parkingspot: ID!
    $date: String!
    $num_of_hours: Int!
    $total: Int!
    $is_paid: Boolean!
  ) {
    createBooking(
      bookingInput: {
        user: $user
        parkingspot: $parkingspot
        date: $date
        num_of_hours: $num_of_hours
        total: $total
        is_paid: $is_paid
      }
    ) {
      obj {
        user {
          first_name
          last_name
        }
        parkingspot {
          name
        }
        date
        num_of_hours
        total
        is_paid
      }
      message
      error
    }
  }
`;

const UPDATE_BOOKING = gql`
  mutation UpdateBooking(
    $id: ID!
    $user: ID!
    $parkingspot: ID!
    $date: String!
    $num_of_hours: Int!
    $total: Int!
    $is_paid: Boolean!
  ) {
    updateBooking(
      bookingInput: {
        id: $id
        user: $user
        parkingspot: $parkingspot
        date: $date
        num_of_hours: $num_of_hours
        total: $total
        is_paid: $is_paid
      }
    ) {
      obj {
        user {
          first_name
          last_name
        }
        parkingspot {
          name
        }
        date
        num_of_hours
        total
        is_paid
      }
      message
      error
    }
  }
`;

const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(bookingInput: { id: $id }) {
      obj {
        user {
          first_name
          last_name
        }
        parkingspot {
          name
        }
        date
        num_of_hours
        total
        is_paid
      }
      message
      error
    }
  }
`;

const GET_AVAILABLE_USERS = gql`
  query {
    getUsers(userInput: { status: true }) {
      obj {
        id
        first_name
        last_name
        status
      }
      message
      error
    }
  }
`;

const GET_AVAILABLE_PARKINGSPOT = gql`
  query {
    getParkingSpots(parkingSpotInput: { available: true, status: true }) {
      obj {
        id
        name
        available
        status
      }
      message
      error
    }
  }
`;

export default function BookingManager() {
  const classes = useStyles();

  const { loading, error, data, refetch } = useQuery(GET_BOOKING);
  const [addBooking] = useMutation(ADD_BOOKING);
  const [updateBooking] = useMutation(UPDATE_BOOKING);
  const [deleteBooking] = useMutation(DELETE_BOOKING);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // add | edit
  const [dimmer, setDimmer] = useState(false);

  // form fields
  const [hiddenIDField, setHiddenIDField] = useState("");
  const [userField, setUserField] = useState("");
  const [parkingspotField, setParkingspotField] = useState("");
  const [dateField, setDateField] = useState(new Date());
  const [numOfHoursField, setNumOfHoursField] = useState(0);
  const [totalField, setTotalField] = useState(0);
  const [isPaidField, setIsPaidField] = useState(false);

  // for fetching user/parkingspot options
  const availableUsersQuery = useQuery(GET_AVAILABLE_USERS);
  const availableParkingspotsQuery = useQuery(GET_AVAILABLE_PARKINGSPOT);

  const setAddModal = () => {
    setModalOpen(true);
    setModalType("add");
    setHiddenIDField("");
    setUserField("");
    setParkingspotField("");
    setDateField(new Date());
    setNumOfHoursField(0);
    setTotalField(0);
    setIsPaidField(false);

    availableUsersQuery.refetch();
    availableParkingspotsQuery.refetch();
  };

  let errorMessage = null;
  if (error)
    errorMessage =
      "An error occurred while fetching Bookings. Please try again later.";
  if (data && data.getBookings.error) errorMessage = data.getBookings.message;

  const user = JSON.parse(
    localStorage.getItem("user") || "{ is_admin: false }"
  );

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
              <TableCell align="center">User</TableCell>
              <TableCell align="center">Parking Spot</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Number of Hours</TableCell>
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">Is Paid</TableCell>
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
              data.getBookings.obj.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell component="th" scope="row">
                      {item.user.first_name} {item.user.last_name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.parkingspot.name.toUpperCase()}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.date}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.num_of_hours} Hours
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.total} Units
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {item.is_paid ? "Yes" : "No"}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <IconButton
                        aria-label="edit"
                        className={classes.margin}
                        onClick={(ev) => {
                          setModalOpen(true);
                          setModalType("edit");
                          setHiddenIDField(item.id);
                          setUserField(item.user.id);
                          setParkingspotField(item.parkingspot.id);
                          setDateField(new Date(item.date));
                          setNumOfHoursField(item.num_of_hours);
                          setTotalField(item.total);
                          setIsPaidField(item.is_paid);

                          availableUsersQuery.refetch();
                          availableParkingspotsQuery.refetch();
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        className={classes.margin}
                        onClick={() => {
                          setDimmer(true);
                          deleteBooking({
                            variables: {
                              id: item.id,
                            },
                          }).then(() => {
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

          <FormControl className={classes.formControl} fullWidth>
            <InputLabel id="demo-simple-select-label">
              User{" "}
              {availableUsersQuery.loading && <CircularProgress size="1em" />}
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={userField}
              onChange={(ev) => {
                setUserField(ev.target.value);
              }}
              disabled={
                availableUsersQuery.loading || availableUsersQuery.error
              }
            >
              {user.is_admin &&
                availableUsersQuery.data &&
                availableUsersQuery.data.getUsers.obj.map((item, index) => {
                  return (
                    <MenuItem key={index} value={item.id}>
                      {item.first_name} {item.last_name}
                    </MenuItem>
                  );
                })}

              {!user.is_admin && (
                <MenuItem value={user.id}>
                  {user.first_name} {user.last_name}
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl className={classes.formControl} fullWidth>
            <InputLabel id="demo-simple-select-label">
              Parking Spot{" "}
              {availableParkingspotsQuery.loading && (
                <CircularProgress size="1em" />
              )}
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={parkingspotField}
              onChange={(ev) => {
                setParkingspotField(ev.target.value);
              }}
              disabled={
                availableParkingspotsQuery.loading ||
                availableParkingspotsQuery.error
              }
            >
              {availableParkingspotsQuery.data &&
                availableParkingspotsQuery.data.getParkingSpots.obj.map(
                  (item, index) => {
                    return (
                      <MenuItem key={index} value={item.id}>
                        {item.name.toUpperCase()}
                      </MenuItem>
                    );
                  }
                )}
            </Select>
          </FormControl>

          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Date picker inline"
              value={dateField}
              onChange={(date) => {
                setDateField(date);
              }}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
          </MuiPickersUtilsProvider>

          <Typography
            id="discrete-slider"
            className={classes.root}
            gutterBottom
          >
            Number of Hours
          </Typography>
          <Slider
            value={numOfHoursField}
            onChange={(ev, val) => {
              setNumOfHoursField(val);
            }}
            valueLabelDisplay="auto"
            step={1}
            min={1}
            max={48}
          />

          <TextField
            label="Total"
            type="number"
            value={totalField}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(ev) => {
              if (ev.target.value === "") {
                setTotalField(0);
              } else {
                setTotalField(parseInt(ev.target.value + ""));
              }
            }}
          />

          {user.is_admin && (
            <FormGroup aria-label="position" className={classes.margin} row>
              <FormControlLabel
                value="top"
                control={
                  <Switch
                    color="primary"
                    checked={isPaidField}
                    onChange={() => {
                      setIsPaidField(!isPaidField);
                    }}
                  />
                }
                className={classes.noSideMargin}
                label="Is Paid"
                labelPlacement="top"
              />
            </FormGroup>
          )}
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

                addBooking({
                  variables: {
                    user: userField,
                    parkingspot: parkingspotField,
                    date: dateField.toLocaleDateString("en-US"),
                    num_of_hours: numOfHoursField,
                    total: totalField,
                    is_paid: isPaidField,
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
                updateBooking({
                  variables: {
                    id: hiddenIDField,
                    user: userField,
                    parkingspot: parkingspotField,
                    date: dateField.toLocaleDateString("en-US"),
                    num_of_hours: numOfHoursField,
                    total: totalField,
                    is_paid: isPaidField,
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
            disabled={
              availableUsersQuery.loading ||
              availableParkingspotsQuery.loading ||
              availableUsersQuery.error ||
              availableParkingspotsQuery.error
            }
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
            Booking Manager
          </Typography>
          <Button color="inherit" onClick={refreshPage}>
            Refresh
          </Button>
          <Button color="inherit" onClick={setAddModal}>
            Add Booking
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
}
