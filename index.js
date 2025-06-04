const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));

let todos = [];

// Health-check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// List and add todos
app.get('/', (req, res) => {
  res.render('index', { todos });
});

app.post('/add', (req, res) => {
  const { item } = req.body;
  if (item && item.trim()) {
    todos.push(item.trim());
  }
  res.redirect('/');
});

app.post('/clear', (req, res) => {
  todos = [];
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
