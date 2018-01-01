const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// GET /employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
  console.log(req.params.employeeId)
  db.all('SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId',
  {$employeeId: req.params.employeeId},
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

// POST /employees/:employeeId/timesheets

  timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date,
          employeeId = req.employee.id;
          console.log(employeeId)
    if (!hours || !rate || !date || !employeeId) {
      return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
        'VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId
    };

    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
          (error, timesheet) => {
            res.status(201).json({timesheet: timesheet});
          });
      }
    });
  });

module.exports = timesheetsRouter;

// db.run(`CREATE TABLE IF NOT EXISTS Timesheet(
//   id INTEGER PRIMARY KEY,
//   hours INTEGER NOT NULL,
//   rate INTEGER NOT NULL,
//   date INTEGER NOT NULL,
//   employee_id INTEGER NOT NULL,
//   FOREIGN KEY(employee_id) REFERENCES Employee(id)
// );`);
