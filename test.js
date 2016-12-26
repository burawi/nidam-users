var assert = require('assert');
var request = require('supertest');
var util = require('util');

var agent = request.agent('http://localhost:3000');
var response;

var forms = {
    nonAdminLogin: {username: 'burawi', password: 'muslim1994'},
    adminLogin: {username: 'admin', password: 'admin'},
    missingUsername: { password: '0000' },
    missingPassword: { username: 'dd' },
    missingBoth: { },
    existingUser: { username: 'burawi', password: '0000'},
    validUser: { username: 'user0', password: '0000'},
    editUser: { username: 'user3', password: '1234' }
}

afterEach(function() {
    console.log("           Response body: " + util.inspect(JSON.stringify(response), {
        depth: null,
        colors: true
    }));
})

describe('USERS API', function() {

    describe('Non Authenticated:', function() {
        it('should return json with false success and code AUTHREQ', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/list')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, false);
                    assert.equal(res.body.code, 'AUTHREQ');
                    done(err);
                });
        });
    });

    describe('Non Admin:', function() {
        it('Login without errors', function(done) {
            this.timeout(5000);
            agent.post('/auth/login')
                .send(forms.nonAdminLogin)
                .expect(302)
                .end(function (err, res) {
                    response = res.body;
                    done(err);
                });
        });

        it('Get User Id', function(done) {
            this.timeout(5000);
            agent.post('/auth/session/userid')
                .expect(200)
                .end(function (err, res) {
                    assert.equal(res.body.success, true);
                    response = res.body;
                    done(err);
                });
        });

        it('should return json with false success and code ADMNREQ', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/list')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, false);
                    assert.equal(res.body.code, 'ADMNREQ');
                    done(err);
                });
        });

        it('Logout without errors', function(done) {
            this.timeout(5000);
            agent.get('/auth/logout')
                .expect(302)
                .end(function (err, res) {
                    response = res.body;
                    done(err);
                });
        });
    });

    describe('Admin:', function() {
        it('Login without errors', function(done) {
            this.timeout(5000);
            agent.post('/auth/login')
                .send(forms.adminLogin)
                .expect(302)
                .end(function (err, res) {
                    response = res.body;
                    done(err);
                });
        });

        it('Should return an array', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/list')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, true);
                    assert.equal(Array.isArray(res.body.msg), true);
                    done(err);
                });
        });
    });

    describe('Add:', function() {
        it('Not sending username', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/add')
                .send(forms.missingUsername)
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, false);
                    assert.equal(res.body.code, 'FORMERR');
                    done(err);
                });
        });

        it('Not sending password', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/add')
                .send(forms.missingPassword)
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, false);
                    assert.equal(res.body.code, 'FORMERR');
                    done(err);
                });
        });

        it('Not sending password & username', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/add')
                .send(forms.missingBoth)
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, false);
                    assert.equal(res.body.code, 'FORMERR');
                    done(err);
                });
        });

        it('Existing Username', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/add')
                .send(forms.existingUser)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, false);
                    assert.equal(res.body.code, 'USREXST');
                    done(err);
                });
        });

        it('Should Add Now', function(done) {
            this.timeout(5000);
            agent.post('/admin/users/add')
                .send(forms.validUser)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    response = res.body;
                    assert.equal(res.body.success, true);
                    done(err);
                    edit(res.body.msg.id);
                });
        });
    });

    function edit(id) {
        describe('Edit:', function() {
            it('Existing username', function(done) {
                this.timeout(5000);
                var form = forms.existingUser;
                form.id = id;
                agent.post('/admin/users/edit')
                    .send(form)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function (err, res) {
                        response = res.body;
                        assert.equal(res.body.success, false);
                        assert.equal(res.body.code, 'USREXST');
                        done(err);
                    });
            });

            it('Valid edit', function(done) {
                this.timeout(5000);
                var form = forms.editUser;
                form.id = id;
                agent.post('/admin/users/edit')
                    .send(form)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function (err, res) {
                        response = res.body;
                        assert.equal(res.body.success, true);
                        assert.equal(res.body.msg.id, form.id);
                        assert.equal(res.body.msg.username, form.username);
                        assert.equal(res.body.msg.password, form.password);
                        done(err);
                        del(res.body.msg.id);
                    });
            });
        });
    }

    function del(id) {
        describe('Delete:', function() {
            it('should return json with success true', function(done) {
                this.timeout(5000);
                var form = {id: id};
                agent.post('/admin/users/delete')
                    .send(form)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function (err, res) {
                        response = res.body;
                        assert.equal(res.body.success, true);
                        done(err);
                    });
            });
        });
    }
});
