const express = require('express');
const path = require('path');
const data = require('./db/db.json');
const fs = require('fs');
const generateUniqueId = require('generate-unique-id');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// function to receive data as argument and write it into given file.
const writeToFile = (destination, content) => {
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) => {
  err ? console.error(err) : console.info(`\nData written to ${destination}`);
  });
}
  
  // function to read from a data file, append and call write function.
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log(data);
        const parsedData = JSON.parse(data);
        parsedData.push(content);
        writeToFile(file, parsedData);
      }
    });
}

  // function to read from a data file, uses filter function to create new filtered
  // data file and call write function.
  const readAndDelete = (id, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        const deleted = parsedData.filter((note) => note.id == id);
        const filtered = parsedData.filter((note) => note.id != id);
        console.info(`Deleted Note: ${deleted.title}`);
        writeToFile('./db/db.json', filtered);
      }
    });
  }

// api get route to return home page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// api get route to return notes.html page.
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "notes.html"));
});

// api get route to return data from data file.
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log(data);
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    }
 });
});

// api post route to save data into data file.
app.post('/api/notes', (req, res) => {
    const {title, text} = req.body;
    if(title && text){
        const newdata = {
            'id': generateUniqueId(),
            title,
            text
        };
        readAndAppend(newdata, './db/db.json');
        const response = {
            status: 'success',
            body: newdata,
        };
        res.json(response);
    }else {
        res.status(500).json('Error in posting note');
    }
});

// api delete route to delete data from data file.
app.delete('/api/notes/:id', (req, res) => {
  if(req.body && req.params.id){
    const delId = req.params.id;
    console.info(`${req.method} request received with id: ${delId}`);
    readAndDelete(delId, './db/db.json');
    res.json(`Delete success`);
    return;
  }
  res.status(500).json('Error in deleting');
});

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}/`);
});