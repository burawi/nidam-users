var prefix = 'users';
var crud = new Vue({
    el: '#page-content',
    data: {
        list: [],
        url: window.location.origin + '/admin/' + prefix,
        seeForm: false,
        formData: {},
        formItemName: '',
        formEdit: false,
        confirmDeleteId: 0,
        loadingForm: false,
        loadingDelete: false,
        txt: {
            success: {
                title: 'Success',
                msg: 'Operation Done!'
            },
            error: {
                title: 'Error',
            }
        },
    },
    methods: {
        showForm: function() {
            this.seeForm = true;
        },
        hideForm: function() {
            this.formData = {};
            this.formItemName = '';
            this.formEdit = false;
            this.seeForm = false;
        },
        switchForm: function() {
            this.seeForm = this.seeForm !== true;
        },
        showError: function (msg) {
            VanillaToasts.create({
                title: this.txt.error.title,
                text: msg,
                type: 'error',
                timeout: 3000,
            });
        },
        edit: function (item) {
            this.formData = {
                id: item.id,
                username: item.username,
            };
            this.formItemName = item.username;
            this.formEdit = true;
            this.showForm();
        },
        updateList: function (form, response) {
            if(!form.hasOwnProperty('id')){
                this.list.push(response);
            } else {
                for (var i = 0; i < this.list.length; i++) {
                    if(this.list[i].id == form.id){
                        this.list[i] = response;
                    }
                }
            }
        },
        isInConfirmDelete: function (item) {
            return this.confirmDeleteId == item.id;
        },
        confirmDelete: function (item) {
            this.confirmDeleteId = item.id;
        },
        cancelDelete: function () {
            this.confirmDeleteId = 0;
        },
        submit: function() {
            var url = this.url;
            url += (this.formEdit) ? '/edit' : '/add';
            this.loadingForm = true;
            this.$http.post(url, this.formData).then(function (response) {
                var resBody = response.body;
                this.loadingForm = false;
                if(!resBody.success){
                    this.showError(resBody.msg);
                }else{
                    VanillaToasts.create({
                        title: this.txt.success.title,
                        text: this.txt.success.msg,
                        type: 'success',
                        timeout: 3000,
                    });
                    this.updateList(this.formData, resBody.msg);
                    this.hideForm();
                }
            });
        },
        deleteItem: function() {
            var url = this.url + '/delete';
            var form = {
                id: this.confirmDeleteId
            };
            this.loadingDelete = true;
            this.$http.post(url, form).then(function (response) {
                var resBody = response.body;
                this.loadingDelete = false;
                if(!resBody.success){
                    this.showError(resBody.msg);
                }else{
                    this.cancelDelete();
                    for (var i = 0; i < this.list.length; i++) {
                        if(this.list[i].id == form.id){
                            this.list.splice(i,1);
                        }
                    }
                }
            });
        },
        loadList: function () {
            var url = this.url + '/list';
            this.$http.post(url).then(function (response) {
                var resBody = response.body;
                if(!resBody.success){
                    this.showError(resBody.msg);
                }else{
                    this.list = resBody.msg;
                }
            });
        }
    }
})
crud.loadList();
