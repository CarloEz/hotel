const query = require('../db/connection');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();
const ctrl = {}

function formatDate(timestamp) {
    let fecha = new Date(timestamp).toISOString().slice(0, 10);
    return fecha;
}

let enviarMensaje = async (obj,objServicio, habitacion,email) => {
    try {
        let codigo = obj.id;
        delete obj.id;
        delete obj.usuario;
        delete habitacion.estado;
        obj = JSON.stringify(obj);
        objServicio = JSON.stringify(objServicio);
        habitacion= JSON.stringify(habitacion);

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:465,
            secure:true,
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.PASSWORD
            }
        });

        await transporter.sendMail({
            from: 'HOTEL PROYECTO <ccamajam@miumg.edu.gt>',
            to: email,
            subject: 'PROYECTO HOTEL',
            text: 'Detalle de reserva',
            html: `<h1>Codigo: ${codigo}</h1>
                   <div> Reserva: <pre>${obj}</pre></div>
                   <div> Habitacion: <pre>${habitacion}</pre> </div>
                   <div> Servicios: <pre>${objServicio}</pre> </div>
                   `

        });

    } catch (e) {
        console.log(e);
    }

}

let Reserva = (date, numero_adultos, numero_menores, fecha, usuario,) => {

    let fechaEntrada = formatDate(fecha[0]);
    let fechaSalida = formatDate(fecha[1]);

    return {
        "id": date,
        numero_adultos,
        numero_menores,
        "fecha_entrada": fechaEntrada,
        "fecha_salida": fechaSalida,
        "estado": "Creada",
        usuario,
    }
}

let Habitacion = (tipo_habitacion, costo, numero,estado ,reserva) => {
    return {
        tipo_habitacion,
        costo,
        numero,
        estado,
        reserva
    }
}

let Servicio = (servicio, costo, numero, reserva) => {
    return {
        servicio,
        numero,
        costo,
        reserva
    }
}

ctrl.encontrar = async (req, res) => {
    try {
        let sql = `select * from reserva where id=${req.params.id}`;
        let sqlServicios=`select * from detalle_servicio where reserva=${req.params.id}`;
        let sqlHabitacion=`select * from detalle_reserva where reserva=${req.params.id}`;
    
        let result = await query(sql);
        let resultServicio = await query(sqlServicios);
        let resultHabitacion = await query(sqlHabitacion);
        
        res.json({result, resultHabitacion, resultServicio});
    } catch (error) {
        res.json({error:"Revise el código"});
    }
}

ctrl.editar = async (req, res) => {
    try {
        console.log(req.body);
        let objeto= req.body;
        delete objeto.id;
    
        let sql = `update reserva set ? where id=${req.params.id}`
        let result = await query(sql,{estado:"checkin"});
        res.json({msg:"Actualizado"});        
    } catch (error) {
        console.log(error);
        res.json({error:"Error"});
    }
}

ctrl.crear = async (req, res) => {
    try {
        let usuario = req.params.user;
        let date = new Date().getTime();
        let sqlReserva = `insert into reserva set ?`;
        let sqlHabitacion = `insert into detalle_reserva set ?`;

        const { numeroMayores, numeroMenores, habitacion, fecha, servicios, correo } = req.body;
        
        const objReserva = Reserva(date, numeroMayores, numeroMenores, fecha, usuario);
        const objHabitacion = Habitacion(habitacion.tipo, habitacion.costo, habitacion.numero, habitacion.estado ,date);

        let resultReserva = await query(sqlReserva, objReserva);
        let resultHabitacion = await query(sqlHabitacion, objHabitacion);

        for (const item of servicios) {
            const objServicio = Servicio(item.tipo, item.costo, item.numero, date);
            const resultServicio = await query('insert into detalle_servicio set ?', objServicio);
        }

        enviarMensaje(objReserva, servicios,habitacion,correo);

        res.json({ msg: "Reservacion Creada" });
    } catch (e) {
        console.log(e);
        res.json({ error: 'Ocurrió un problema' });
    }
}

ctrl.editarServicio = async (req, res) => {
    try {
        let sql= `update detalle_servicio set ? where id="${req.params.id}"`;
        let result = await query(sql, req.body);
        res.json({msg:"Actualizado"});
    } catch (error) {
        console.log(error);
        res.json({error:"Error"});
    }
}

ctrl.estadoCuenta = async (req, res) => {
    try {
        let sqlHabitacion= `select SUM(costo) as habitacion from detalle_reserva where reserva=${req.params.id}`;
        let sqlServicios= `select SUM(costo) as servicios from detalle_servicio where reserva=${req.params.id}`;
        let sqlAbonos = `select SUM(abono) as abonos from abonos where reserva=${req.params.id}`;
        let sqlreserva = `select estado,id from reserva where id=${req.params.id}`;
        let sqlEmpresas =`select * from empresas`;
    
        let resultAbonos = await query(sqlAbonos);
        let resultHabitacion = await query(sqlHabitacion);
        let resultServicio = await query(sqlServicios);
        let resultEmpresas = await query(sqlEmpresas);
        let resultReserva  = await query(sqlreserva);
        
        res.json({"reserva":resultReserva[0].id, "estado":resultReserva[0].estado, "habitacion":resultHabitacion[0].habitacion, "servicios":resultServicio[0].servicios, "abonos":resultAbonos[0].abonos,"empresas":resultEmpresas});
    } catch (error) {
        console.log(error);
        res.json({error:"error"});
    }
}

ctrl.abono = async (req, res) => {
    try {
        let sql= `insert into abonos set ?`;
        let result = await query(sql, req.body);
        res.json({msg:"Registrado"});
    } catch (error) {
        console.log(error);
        res.json({error:"Error"});
    }
}

ctrl.crearEmpresa = async (req, res) => {
    try {
        console.log(req.body);
        let sql= `insert into empresas set ?`;
        let result = await query(sql, req.body);
        res.json({msg:"Registrado"});
    } catch (error) {
        console.log(error);
    }
}

ctrl.cancelarReserva = async (req, res) => {
    try {
        console.log(req.body);
        let sql= `insert into abonos set ?`;
        let sqlReserva =`update reserva set estado="cancelado" where id="${req.body.reserva}"`
        let result = await query(sql, req.body);
        let resultReserva = await query(sqlReserva);
        res.json({msg:"Cancelado"});
    } catch (error) {
        console.log(error);
    }
}

ctrl.credito = async (req, res) => {
    try {
        console.log(req.body);
        let sql= `insert into credito set ?`;
        let sqlReserva =`update reserva set ? where id=${req.body.reserva}`;
        let result = await query(sql, req.body);
        let resultReserva = await query(sqlReserva,{estado:"credito"});
        res.json({msg:"Registrado"});
    } catch (error) {
        console.log(error);
    }
}

ctrl.Listadocredito = async (req, res) => {
    try {
        console.log(req.body);
        let sql= `select r.id, r.estado, c.dias from credito as c
                inner join reserva as r on c.reserva=r.id
                inner join usuario as u on r.usuario=u.id
                where u.correo="${req.body.correo}"
                order by r.estado desc`;
        let result = await query(sql);
        res.json({result});
    } catch (error) {
        console.log(error);
    }
}

ctrl.agregarServicio = async (req, res) => {
    try {     
        console.log(req.body);
        const resultServicio = await query('insert into detalle_servicio set ?', req.body);
        res.json({msg:"Agregado a la reserva"});
    } catch (error) {
        console.log(error);
        res.json({error:"No se pudo agregar servicio"});
    }
}

ctrl.disponibilidad = async (req, res) => {
    try {     
        console.log(req.body.fecha);
        const sql=`select dr.estado,dr.tipo_habitacion,dr.numero,dr.reserva,dr.id from reserva as r inner join detalle_reserva as dr on r.id=dr.reserva where fecha_salida="${req.body.fecha}";`
        const result = await query(sql);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({error:"Surgio un error"});
    }
}

ctrl.liberar = async (req, res) => {
    try {     
        console.log(req.body);
        const sql=`update detalle_reserva set ? where id="${req.params.id}"`;
        const result = await query(sql,req.body);
        res.json({msg:"Habitaciones disponibles"});
    } catch (error) {
        console.log(error);
        res.json({error:"Surgio un error"});
    }
}

module.exports = ctrl;