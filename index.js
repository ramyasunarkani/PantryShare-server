require('dotenv').config();
const connectDB = require('./config/db-connection');
const cors = require('cors');
const express = require('express');

const userRoute=require('./routes/userRoute')
const itemRoute=require('./routes/itemRoute')
const reservationRoute=require('./routes/reservationRoutes')


const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('API is working');
});

app.use('/auth',userRoute);
app.use('/items',itemRoute);
app.use('/reservations',reservationRoute);



(async () => {
  try {
    await connectDB();
    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
})();
