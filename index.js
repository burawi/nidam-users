var express = require('express');
var router = express.Router();
var adminRouter = express.Router();
var tayrPassport = require('tayr-passport');

module.exports = function(G,mdl) {

    var T = G[mdl.conf.tayrProp];
    var table = mdl.conf.table;

    adminRouter.get('*', G.auth.F.isAuthenticated, G.auth.F.isAdmin);
    adminRouter.post('*', G.auth.F.isAuthenticated, G.auth.F.isAdmin);

    adminRouter.get('/', function(req, res, next) {
        mdl.F.list().then(function (list) {
            G.nidam.render(req, res, mdl.V.P.page, {mdl: mdl});
        });
    });

    adminRouter.post('/list', function(req, res, next) {
        mdl.F.list().then(function (list) {
            res.json({success: true, msg: list});
        });
    });

    adminRouter.post('/add',
        mdl.F.verify,
        mdl.F.isUnique,
        function(req, res, next) {
            mdl.F.add(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/edit',
        mdl.F.verify,
        mdl.F.isUnique,
        function(req, res, next) {
            mdl.F.edit(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/delete', function(req, res, next) {
        mdl.F.delete(req).then(function (deleted) {
            res.json({success: true});
        });
    });

    G.app.use('/' + mdl.conf. prefix, router);
    G.app.use('/admin/' + mdl.conf. prefix, adminRouter);
};
