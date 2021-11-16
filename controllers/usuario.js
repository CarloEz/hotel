const query = require('../db/connection');
const ctrl = {};

ctrl.registro = async (req, res) => {
    try {
        const { nombre, correo, contraseña, rol } = req.body;
        let usuario = { nombre, correo, "clave":contraseña ,rol };

        const sql = `Insert into usuario set ?`;
        const sqlEmailExist = `Select correo from usuario where correo='${correo}'`;

        let resultEmailExist = await query(sqlEmailExist);

        if (resultEmailExist.length > 0) {
            res.json({ error: 'Este correo esta en uso' });
        } else {
            let result = await query(sql, usuario);
            if (result.affectedRows) {
                res.json({msg: 'usuario registrado'});
            };
        }
    } catch (e) {
        console.log(e);
        res.json({ error: "Vuelve a intentarlo" });
    }
}

ctrl.login = async (req, res) => {
    try {
        const usuario = await query(`select id,rol,correo from usuario where correo="${req.body.correo}" and clave="${req.body.contraseña}"`);

        if (usuario.length > 0) {
            res.json({ msg: usuario[0].id, tipo: usuario[0].rol, correo:usuario[0].correo });
        } else {
            res.json({error:'verifica tus datos'});
        }
    } catch (e) {
        console.log(e);
        res.json({error:'Error al autenticar'});
    }
}

module.exports = ctrl;