const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Checks for valid TimeSheet ID
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


// GET /employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
  // console.log(req.params.employeeId)
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
          // console.log(employeeId)
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

  // PUT /employees/:employeeId/timesheets/:timesheetsId/
  timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date,
          employeeId = req.employee.id;
    if (!hours || !rate || !date || !employeeId) {
      return res.sendStatus(400);
    }
    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE Timesheet.employee_id = $employeeId';
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
        db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
          (error, timesheet) => {
            res.status(200).json({timesheet: timesheet});
          });
      }
    });
  });

// Delete /employees/:employeeId/timesheets/:timesheetId
  timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = 'DELETE FROM TimeSheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: req.params.timesheetId};

    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
  });


module.exports = timesheetsRouter;
