function autorizarAdmin(req, res, next) {
    if (!req.usuario || req.usuario.tipo !== "ADMIN") {
        return res.status(403).json({
            mensagem: "Acesso permitido apenas para administradores."
        });
    }

    next();
}

module.exports = autorizarAdmin;