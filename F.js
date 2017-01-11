var randomstring = require("randomstring");
var pick = require('js-object-pick');
var omit = require('object.omit');
var md5 = require('md5');
var valod = require('valod');

module.exports = function (G,conf) {

    var T = G.E[conf.tayrProp];
    var table = conf.table;
    var tableProps = conf.tableProps;
    var privateTableProps = conf.privateTableProps;
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
            T.findOne('user', uniqueBy + ' = ? AND id <> ? ', [req.body[uniqueBy], req.body.id]).then( function (user) {
                if(!user){
                    next();
                }else {
                    res.json({success: false, msg: conf.msg.userExists, code: 'USREXST'});
                }
            })
        },
        format: function (item) {
            var res;
            if(Array.isArray(item)){
                res = [];
                item.forEach(function (row) {
                    res.push(exports.format(row));
                });
                return res;
            } else {
                return omit(item, privateTableProps);
            }
        },
        list: function () {
            return new Promise(function(resolve, reject) {
                T.find(table).then(function (list) {
                    list = exports.format(list);
                    resolve(list);
                })
            });
        },
        add: function (req) {
            return new Promise(function(resolve, reject) {
                var item = new T.tayr(table,pick(req.body,tableProps));
                item.store().then(function () {
                    item = exports.format(item);
                    resolve(item);
                })
            });
        },
        edit: function (req) {
            return new Promise(function(resolve, reject) {
                var item = new T.tayr(table,pick(req.body,tableProps));
                item.id = req.body.id;
                item.store().then(function () {
                    item = exports.format(item);
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
