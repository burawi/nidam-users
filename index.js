var express = require('express');
var router = express.Router();
var adminRouter = express.Router();
var tayrPassport = require('tayr-passport');

module.exports = function(G,mdl) {

    var T = G[mdl.conf.tayrProp];
    var table = mdl.conf.table;

    adminRouter.get('/', function(req, res, next) {
        mdl.V.P.admin.extends(G.main.V.L.admin);
        G.nidam.render(req, res, mdl.V.P.admin, {mdl: mdl});
    });

    adminRouter.post('/list', function(req, res, next) {
        mdl.F.list().then(function (list) {
            res.json({success: true, msg: list});
        });
    });

    adminRouter.post('/add',
        mdl.F.verify,
        mdl.F.isUnique,
        G.auth.F.verifyAdminPassword,
        function(req, res, next) {
            mdl.F.add(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/edit',
        mdl.F.verify,
        mdl.F.isUnique,
        G.auth.F.verifyAdminPassword,
        function(req, res, next) {
            mdl.F.edit(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/delete',
        function(req, res, next) {
            mdl.F.delete(req).then(function (deleted) {
                res.json({success: true});
            });
        }
    );

    G.app.use('/' + mdl.conf. prefix, router);
    G.app.use('/admin/' + mdl.conf. prefix, adminRouter);
};
