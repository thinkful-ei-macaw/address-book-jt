require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const uuid = require('uuid/v4');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());
app.use(cors());

function validateBearer(req, res, next) {
  const API_KEY = process.env.API_KEY;
  const auth_token = req.get('Authorization');
  if (auth_token && !auth_token.toLowerCase().startsWith('bearer')) {
    return res
      .status(400)
      .json({ error: 'Invalid Autorization Method: Must use Bearer Strategy' });
  }
  if (!auth_token || auth_token.split(' ')[1] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
}

const ADDRESS_BOOK = [
  {
    id: 'aa1c572a-6f93-11ea-bc55-0242ac130003',
    firstName: 'Bob',
    lastName: 'Shmeee',
    address1: '32 Dreary Lane',
    address2: '3',
    city: 'East Greenbush',
    state: 'NY',
    zip: '12219',
  },
  {
    id: 'b6a9791e-6f93-11ea-bc55-0242ac130003',
    firstName: 'Nancy',
    lastName: 'Smith',
    address1: '99 Thrush Terrace',
    city: 'East Greenbush',
    state: 'NY',
    zip: '12219',
  },
];

app.get('/address', (req, res) => {
  res.status(200).json(ADDRESS_BOOK);
});

app.post('/address', validateBearer, (req, res) => {
  const {
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip,
  } = req.body;

  if (!firstName) {
    return res.status(400).send('First name required');
  }

  if (!lastName) {
    return res.status(400).send('Last name required');
  }

  if (!address1) {
    return res.status(400).send('Address is required');
  }

  if (!city) {
    return res.status(400).send('City is required');
  }

  if (!state) {
    return res.status(400).send('State is required');
  }

  if (!zip) {
    return res.status(400).send('Zip is required');
  }

  if (state.length !== 2) {
    return res.status(400).send('Must use 2 digit state code');
  }

  if (zip.length !== 5) {
    return res.status(400).send('Must use 5 digit zip code');
  }

  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip,
  };

  ADDRESS_BOOK.push(newAddress);

  res
    .status(201)
    .location(`https://localhost:8000/${id}`)
    .send('Address created');
});

app.delete('/address/:id', validateBearer, (req, res) => {
  const indexOfAddress = ADDRESS_BOOK.findIndex(
    (address) => address.id === req.params.id,
  );
  ADDRESS_BOOK.splice(indexOfAddress, 1);
  res.status(204).end();
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.essage, error };
  }
  res.status(500).json(response);
});

module.exports = app;
