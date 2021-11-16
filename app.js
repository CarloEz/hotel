const express =require("express");
const dotenv= require('dotenv');
const morgan = require('morgan');
const cors=require('cors');
const app=express();

dotenv.config();
let PORT = process.env.PORT||3000;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(morgan('dev'));

app.use(cors());

app.use('/reserva',require('./routes/reservas'));
app.use('/auth',require('./routes/usuario'));

app.listen(PORT,()=>{
console.log('Server');
})