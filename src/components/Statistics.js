import moment from "moment";

import { makeStyles } from "@material-ui/core/styles";
import {
  TableCell,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Chip,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Equalizer, Equalizer as EqualizerIcon } from "@material-ui/icons";

import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: 10,
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
  statisticsHeader: {
    textAlign: "left",
    margin: theme.spacing(2),
  },
  tableHead: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  marginSides: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
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

const getYearWeek = (date) => {
  return `${moment(date).year()}${moment(date).week()}`;
};

const currentYearWeek = getYearWeek(new Date());

const foo = (a, b, c) => {
  console.log("a");
  console.log(a);
  console.log("b");
  console.log(b);
  console.log("c");
  console.log(c);

  return a === b;
};

export default function Statistics() {
  const classes = useStyles();

  const { loading, error, data } = useQuery(GET_BOOKING);

  let dataByWeek = {};
  if (data) {
    dataByWeek = data.getBookings.obj
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateA > dateB;
      })
      .reduce((acc, objItem) => {
        const yearWeek = getYearWeek(objItem.date);

        if (!acc[yearWeek]) {
          acc[yearWeek] = [];
        }

        acc[yearWeek].push({
          date: objItem.date,
          cost: objItem.parkingspot.cost,
          hours: objItem.num_of_hours,
          total: objItem.total,
          is_paid: objItem.is_paid,
        });

        return acc;
      }, {});
  }

  console.log("dataByWeek");
  console.log(dataByWeek);
  console.log("currentYearWeek");
  console.log(currentYearWeek);

  // number of bookings
  // Total amount of payment

  return (
    <>
      <Typography
        variant="h4"
        className={classes.statisticsHeader}
        color="primary"
      >
        <EqualizerIcon color="primary" fontSize="default" /> Statistics
      </Typography>

      <TableContainer component={Paper}>
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHead} align="center">
                Week #
              </TableCell>
              <TableCell className={classes.tableHead} align="center">
                Nº of Bookings
              </TableCell>
              <TableCell className={classes.tableHead} align="center">
                Accumulated Cost
              </TableCell>
              <TableCell className={classes.tableHead} align="center">
                Total Hours
              </TableCell>
              <TableCell className={classes.tableHead} align="center">
                Totals
              </TableCell>
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

            {Object.keys(dataByWeek).map((key, index) => {
              const reducedWeekBookings = dataByWeek[key].reduce(
                (acc, cur) => {
                  return {
                    week: acc.week,
                    num: acc.num + 1,
                    cost: acc.cost + cur.cost,
                    hours: acc.hours + cur.hours,
                    total: acc.total + cur.total,
                  };
                },
                {
                  week: key,
                  num: 0,
                  cost: 0,
                  hours: 0,
                  total: 0,
                }
              );

              return (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {reducedWeekBookings.week}{" "}
                    {currentYearWeek === reducedWeekBookings.week ? (
                      <Chip
                        className={classes.marginSides}
                        variant="outlined"
                        color="primary"
                        align="right"
                        size="small"
                        label="current week"
                      />
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {reducedWeekBookings.num} Bookings
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {reducedWeekBookings.cost} Units
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {reducedWeekBookings.hours} Hours
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {reducedWeekBookings.total} Units
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
