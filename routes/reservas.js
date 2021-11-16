const router= require('express').Router();
const { crear, encontrar, editar, estadoCuenta, crearEmpresa, abono, cancelarReserva, credito, Listadocredito, agregarServicio, disponibilidad, liberar, editarServicio } = require('../controllers/reservas')

router.get('/:id',encontrar);
router.get('/estado/:id',estadoCuenta);
router.get('/credito/:user',cancelarReserva);
router.post('/empresa',crearEmpresa);
router.post('/abono',abono);
router.post('/cancelar',cancelarReserva);
router.post('/servicio',agregarServicio);
router.post('/disponibilidad',disponibilidad);
router.post('/credito',credito);
router.post('/creditos',Listadocredito);
router.post('/:user',crear);
router.put('/checkin/:id', editar);
router.put('/editar/servicio/:id', editarServicio);
router.put('/liberar/:id', liberar);

module.exports=router;