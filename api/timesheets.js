const express = require('express');
const timesheetsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// GET /employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
  db.use('SELECT * FROM Timesheet WHERE Employee.id = $employeeId',
  {$employeeId: req.param.employeeId},
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

// GET /employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
  res.status(200).json({timesheet: req.timesheet});
});

module.exports = timesheetsRouter;
