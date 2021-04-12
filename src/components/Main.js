import { useState } from "react";
import { Redirect } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import { Container, AppBar, Tabs, Tab } from "@material-ui/core";

import Dashboard from "./Dashboard";
import UserManager from "./UserManager";
import SpotManager from "./SpotManager";
import BookingManager from "./BookingManager";
import Statistics from "./Statistics";

import {
  MenuBook as MenuBookIcon,
  Room as RoomIcon,
  PeopleOutline as PeopleOutlineIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Equalizer as EqualizerIcon,
} from "@material-ui/icons";

function Main(props) {
  const [value, setValue] = useState(0);
  const [redirect, setRedirect] = useState();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: "transparent", // theme.palette.background.paper
    },
  }));

  const classes = useStyles();

  const user = JSON.parse(
    localStorage.getItem("user") || "{ is_admin: false }"
  );

  const adminTabs = [
    <Tab key={0} label="Dashboard" icon={<DashboardIcon />} />,
    <Tab key={1} label="User Manager" icon={<PeopleOutlineIcon />} />,
    <Tab key={2} label="Spot Manager" icon={<RoomIcon />} />,
    <Tab key={3} label="Booking Manager" icon={<MenuBookIcon />} />,
    <Tab key={4} label="Statistics" icon={<EqualizerIcon />} />,
  ];

  return (
    <div className={classes.root}>
      {redirect}

      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          indicatorColor="primary"
          textColor="primary"
          aria-label="scrollable force tabs example"
        >
          {user.is_admin ? (
            adminTabs
          ) : (
            <Tab label="Booking Manager" icon={<MenuBookIcon />} />
          )}
          <Tab
            label="Log Out"
            icon={<ExitToAppIcon />}
            onClick={() => {
              localStorage.removeItem("token");
              setRedirect(<Redirect to="/" />);
            }}
          />
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" spacing={10}>
        {user.is_admin ? (
          <>
            {value === 0 && <Dashboard />}
            {value === 1 && <UserManager />}
            {value === 2 && <SpotManager />}
            {value === 3 && <BookingManager />}
            {value === 4 && <Statistics />}
          </>
        ) : (
          <>
            {/* in case you want to add more later */}
            {value === 0 && <BookingManager />}
          </>
        )}
      </Container>
    </div>
  );
}

export default Main;
