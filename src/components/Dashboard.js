import { makeStyles } from "@material-ui/core/styles";
import {
  TableCell,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import {
  Chart,
  ArgumentAxis,
  AreaSeries,
  Legend,
  Title,
} from "@devexpress/dx-react-chart-material-ui";
import { Dashboard as DashboardIcon } from "@material-ui/icons";

import { curveCatmullRom, area } from "d3-shape";

import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

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

const GET_BOOKING = gql`
  query {
    getBookings(bookingInput: {}) {
      obj {
        parkingspot {
          id
          cost
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

const listOfWeekDays = [
  new Date(),
  new Date(new Date().setDate(new Date().getDate() - 1)),
  new Date(new Date().setDate(new Date().getDate() - 2)),
  new Date(new Date().setDate(new Date().getDate() - 3)),
  new Date(new Date().setDate(new Date().getDate() - 4)),
  new Date(new Date().setDate(new Date().getDate() - 5)),
].map((item) => item.toLocaleDateString("en-US"));

export default function Dashboard() {
  const classes = useStyles();

  const { loading, error, data } = useQuery(GET_BOOKING);

  const chartData = data
    ? data.getBookings.obj
        .map((item) => ({
          cost: item.parkingspot.cost,
          date: item.date,
          hours: item.num_of_hours,
          total: item.total,
          is_paid: item.is_paid,
        }))
        .filter((item) => listOfWeekDays.includes(item.date))
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          return dateA > dateB;
        })
    : [];

  const Area = (props) => {
    const { coordinates, color } = props;

    return (
      <path
        fill={color}
        d={area()
          .x(({ arg }) => arg)
          .y1(({ val }) => val)
          .y0(({ startVal }) => startVal)
          .curve(curveCatmullRom)(coordinates)}
        opacity={0.5}
      />
    );
  };

  let errorMessage = null;
  if (error)
    errorMessage =
      "An error occurred while fetching Bookings. Please try again later.";
  if (data && data.getBookings.error) errorMessage = data.getBookings.message;

  return (
    <>
      <Typography className={classes.margin} variant="h2" color="primary">
        <DashboardIcon fontSize="large" color="primary" /> Dashboard
      </Typography>

      {errorMessage && (
        <Alert className={classes.margin} severity="error">
          {errorMessage}
        </Alert>
      )}

      <Paper className={classes.margin}>
        {loading && (
          <TableRow>
            <TableCell>
              <CircularProgress />
            </TableCell>
          </TableRow>
        )}

        <Chart data={chartData} style={{ paddingLeft: "20px" }}>
          <ArgumentAxis tickFormat={() => (tick) => tick} />

          <AreaSeries
            name={`Costs: ${chartData.reduce(
              (acc, curr) => acc + curr.cost,
              0
            )} Units`}
            valueField="cost"
            argumentField="date"
            seriesComponent={Area}
          />

          <AreaSeries
            name={`Number of Hours: ${chartData.reduce(
              (acc, curr) => acc + curr.hours,
              0
            )} Hours`}
            valueField="hours"
            argumentField="date"
            seriesComponent={Area}
          />

          <AreaSeries
            name={`Totals: ${chartData.reduce(
              (acc, curr) => acc + curr.total,
              0
            )} Units`}
            valueField="total"
            argumentField="date"
            seriesComponent={Area}
          />

          <Legend />
          <Title text="Booking Sales" />
        </Chart>
      </Paper>
    </>
  );
}
