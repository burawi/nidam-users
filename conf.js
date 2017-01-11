var randomstring = require("randomstring");

module.exports = function (G) {

    var exports = {
        tayrProp: 'T',
        table: 'user',
        uniqueBy: 'username',
        tableProps: [
            'username',
            'password'
        ],
        privateTableProps: [
            'password'
        ],
        msg: {
            name: 'name',
            add: 'add',
            edit: 'edit',
            delete: 'delete',
            noUsernameGiven: 'No username given!',
            noPasswordGiven: 'No password given!',
            userExists: 'This user already exists!'
        },
    };

    exports.norms = {
        username: [['required'], exports.msg.noUsernameGiven],
        password: [['required'], exports.msg.noPasswordGiven]
    };

    return exports;
};
