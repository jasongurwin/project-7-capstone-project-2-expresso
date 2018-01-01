const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// GET /menus/:menuId/menu-items
menuItemsRouter.get('/', (req, res, next) => {
  const menuId = req.params.menuId
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const values = {$menuId: menuId};

  db.all(sql,values,(err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menuItems: menuItems});
      }
    });
});

module.exports = menuItemsRouter;
