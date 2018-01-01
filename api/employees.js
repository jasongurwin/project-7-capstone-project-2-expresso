const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Creates Timesheets Router
const timesheetsRouter = require('./timesheets.js')
employeesRouter.use('/:employeeId/timesheets',timesheetsRouter);

//Looks up Employee by ID, throws error if doesn't exist
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// GET /employees
employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});

// GET /employees/:employeeId
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

// POST /employees/

  employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name,
          wage = req.body.employee.wage,
          position = req.body.employee.position,
          isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !wage || !position) {
      return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Employee (name, wage, position, is_current_employee)' +
        'VALUES ($name, $wage, $position, $isCurrentEmployee)';
    const values = {
      $name: name,
      $wage: wage,
      $position: position,
      $isCurrentEmployee: isCurrentEmployee
    };

    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
          (error, employee) => {
            res.status(201).json({employee: employee});
          });
      }
    });
  });

  // Delete /employees/:employeeId/
    employeesRouter.delete('/:employeeId', (req, res, next) => {
      const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
      const values = {$employeeId: req.params.employeeId};

      db.run(sql, values, (error) => {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
            (error, employee) => {
              res.status(200).json({employee: employee});
            });
        }
      });
    });

// db.run(`CREATE TABLE IF NOT EXISTS Employee(
//   id INTEGER PRIMARY KEY,
//   name TEXT NOT NULL,
//   position TEXT NOT NULL,
//   wage INTEGER NOT NULL,
//   is_current_employee INTEGER NOT NULL DEFAULT "1"
// );`);


module.exports = employeesRouter;
