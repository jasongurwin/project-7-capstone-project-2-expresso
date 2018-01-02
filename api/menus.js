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
      // console.log(req.menu)
      next();

    } else {
      res.sendStatus(404);
    }
  });
});

// GET /menus
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

// GET /menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  // console.log(title)
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title)' +
      'VALUES ($title)';
  const values = {
    $title: title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});

// PUT /menus/:menuId

menusRouter.put('/:menuId', (req,res,next) => {
  const title = req.body.menu.title

  if (!title) {
    return res.sendStatus(400)
  }

  const sql = 'UPDATE Menu SET title = $title'
  const values = {$title: title}

  db.run(sql,values,(error) => {
    if (error){
      next(error)
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error,menu) => {
        res.status(200).json({menu: menu})
      })
    }
  })

});

// DELETE /menus/:menuId

menusRouter.delete('/:menuId', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const values = {$menuId: req.params.menuId};

  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      // console.log(menuItem)
      res.sendStatus(400);
    } else {
      // console.log(menuItem)

        const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
        // console.log(sql)
        const values = {$menuId: req.params.menuId};
        // console.log(values)

        db.run(sql, values, (error) => {
          if (error) {
            next(error);
          } else {
            res.sendStatus(204);
    }
  });
}
});
});

module.exports = menusRouter;
