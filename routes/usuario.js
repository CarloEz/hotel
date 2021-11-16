const router= require('express').Router();
const { registro, login } = require('../controllers/usuario');

router.post('/login', login);

router.post('/register', registro);

module.exports=router;