var randomstring = require("randomstring");
var pick = require('js-object-pick');
var md5 = require('md5');
var valod = require('valod');

module.exports = function (G,conf) {

    var T = G.E[conf.tayrProp];
    var table = conf.table;
    var tableProps = conf.tableProps;
    var uniqueBy = conf.uniqueBy;

    var exports = {
        verify: function (req, res, next) {
            var validation = new valod(conf.norms);
            var check = validation.check(req.body);
            if(check.valid){
                next();
            }else {
                res.json({success: false, msg: check.errors.join('\n'), code: 'FORMERR'});
            }
        },
        isUnique: function (req, res, next) {
            if(req.body.id === undefined) req.body.id = 0;
            T.findOne('user',{
                sql: uniqueBy + ' = ? AND id <> ? ',
                vals: [req.body[uniqueBy], req.body.id]
            }).then( function (user) {
                if(!user){
                    next();
                }else {
                    res.json({success: false, msg: conf.msg.userExists, code: 'USREXST'});
                }
            })
        },
        list: function () {
            return new Promise(function(resolve, reject) {
                T.find(table).then(function (list) {
                    resolve(list);
                })
            });
        },
        add: function (req) {
            return new Promise(function(resolve, reject) {
                var item = new T.tayr(table,pick(req.body,tableProps));
                item.store().then(function () {
                    resolve(item);
                })
            });
        },
        edit: function (req) {
            return new Promise(function(resolve, reject) {
                var item = new T.tayr(table,pick(req.body,tableProps));
                item.id = req.body.id;
                item.store().then(function () {
                    resolve(item);
                })
            });
        },
        delete: function (req) {
            return new Promise(function(resolve, reject) {
                var item = new T.tayr(table,{
                    id: req.body.id
                });
                item.delete().then(function () {
                    resolve(true);
                });
            });
        },
    };

    return exports;
}
