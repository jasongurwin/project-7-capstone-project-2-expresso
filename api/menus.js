const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Creates menuItems Router
const menuItemsRouter = require('./menu-items.js')
menusRouter.use('/:menuId/menu-items',menuItemsRouter);

//Looks up Menu by ID, throws error if doesn't exist
menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();

    } else {
      res.sendStatus(404);
    }
  });
});


menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu',
    (err, menus) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }
    });
});

// GET /employees/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});


module.exports = menusRouter;
