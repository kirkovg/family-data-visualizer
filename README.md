# Family Data Visualizer
Working project as part of the course User Interfaces @ FCSE

## Built with 
* [Bootstrap](http://getbootstrap.com/)
* [goJS](https://gojs.net/)
* [Node.js](https://nodejs.org/)
* [express.js](https://expressjs.com)

## Authors
* [Gjorgji Kirkov](https://github.com/kirkovg)
* Marijana Kotoska

## How to run (step by step)
* install  [git](https://git-scm.com/downloads)
* install [node.js](https://nodejs.org/en/download/) and npm
* clone the project (`git clone https://github.com/kirkovg/family-data-visualizer.git`)
* go to root directory
* run `npm install` (this may take a few minutes)
* go to `src/` directory
* run the `seed-database.js` file to create the database with the command `node seed-database.js`
* a file is going to be created in `data/database.db`
* run the `server.js` file with `node server.js` command
* back to root directory
* open the `index.html` file in a browser

## Features
+   First View (Family tree)
    1. on right-click on an person opens a context menu
    2. on a left click opens an edit menu for the person's data
    3. after clicking save it updates the diagram with the newly entered data
    4. on click and drag of a child to another parent, the structure will update with the new relationship
    5. on click of switch views button, the view will be changed to the dom-tree-like view of the data

+ Second view (DOM Tree)
    1. at first load the tree and all of its leaves are expanded
    2. on clicking the minus sign it retracts the children of the leaf that was selected
    3. on clicking the plus sign it expands the children of the selected leaf
    4. on click of switch views button, the view will be changed to the family-tree view of the data