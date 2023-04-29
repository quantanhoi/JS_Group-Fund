const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.post('/save-json', (req, res) => {
  const jsonContent = JSON.stringify(req.body, null, 2);
  const filePath = path.join(__dirname, 'data.json');

  fs.writeFile(filePath, jsonContent, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error saving JSON data.' });
    }
    res.status(200).send({ message: 'JSON data saved successfully.' });
  });
});

app.get('/get-json', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  try {
    const data = fs.readFileSync(filePath);
    console.log(data);
    res.status(200).send(JSON.parse(data));
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'Error retrieving JSON data.' });
  }
});




// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
