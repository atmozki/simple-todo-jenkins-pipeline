const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Use EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse URL-encoded bodies (from form submissions)
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory array to hold todos
let todos = [];

// Show the list of todos and form to add new ones
app.get('/', (req, res) => {
  res.render('index', { todos });
});

// Handle form POST to add a new todo
app.post('/add', (req, res) => {
  const { item } = req.body;
  if (item && item.trim().length > 0) {
    todos.push(item.trim());
  }
  res.redirect('/');
});

// (Optional) Handle clearing all todos
app.post('/clear', (req, res) => {
  todos = [];
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
