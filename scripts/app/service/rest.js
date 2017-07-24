app.service('RestService', ['$http', function ($http) {
    let baseURl = 'http://dmls.iust.ac.ir:8099';
    let self = this;
    this.ingoing = 0;

    self.init = function (rootAddress) {
        baseURl = rootAddress;
    };

    function onerror(response) {
        loading.hide();
        self.ingoing--;
        console.log('error : ', response);
        return response;
    }

    function onsuccess(response) {
        loading.hide();
        self.ingoing--;
        return response;
    }

    function get(url, params, headers) {
        params = params || {};
        params.random = new Date().getTime();

        let req = {
            method: 'GET',
            url: url,
            headers: headers || {},
            params: params
        };

        self.ingoing++;
        loading.show();
        return $http(req).then(onsuccess, onerror);
    }

    function post(url, data, headers) {
        let req = {
            method: 'POST',
            url: url,
            headers: headers,
            data: data
        };

        self.ingoing++;
        loading.show();

        return $http(req).then(onsuccess, onerror);
        //return $http.post(url, data, headers).then(onsuccess, onerror);
    }

    // general

    this.getPrefixes = function () {
        let url = 'http://194.225.227.161:8090/mapping/rest/v1/prefixes';
        return get(url);
    };

    // Login

    this.login = function (username, password) {
        let url = baseURl + '/services/rs/v1/users/login';
        let headers = {'Authorization': 'Basic ' + btoa(username + ':' + password)};
        return get(url, {}, headers);
    };

    //

    this.users = {
        load: function (authToken, name, username, pageIndex, pageSize) {
            let url = baseURl + '/services/rs/v1/users/search';
            let headers = {"x-auth-token": authToken};
            let params = {
                name: name,
                username: username,
                page: pageIndex,
                pageSize: pageSize
            };
            return get(url, params, headers);
        },
        save: function (authToken, name, username, permissions, password, identifier) {
            let url = baseURl + '/services/rs/v1/users/edit';
            let headers = {"x-auth-token": authToken};
            let params = {
                name: name,
                username: username,
                permissions: permissions,
                password: password,
                identifier: identifier
            };
            return post(url, params, headers);
        }
    };

    this.profile = {
        load: function (authToken) {
            let url = baseURl + '/services/rs/v1/profile/edit';
            let headers = {"x-auth-token": authToken};
            let params = {};
            return post(url, params, headers);
        },
        updateName: function (authToken, name) {
            let url = baseURl + '/services/rs/v1/profile/edit';
            let headers = {"x-auth-token": authToken};
            let params = {
                name: name
            };
            return post(url, params, headers);
        },
        updatePassword: function (authToken, currentPassword, newPassword) {
            let url = baseURl + '/services/rs/v1/profile/edit';
            let headers = {"x-auth-token": authToken};
            let params = {
                currentPassword: currentPassword,
                newPassword: newPassword
            };
            return post(url, params, headers);
        }
    };

    this.permissions = {
        load: function (authToken) {
            let url = baseURl + '/services/rs/v1/forwards/permission/list';
            let headers = {"x-auth-token": authToken};
            let params = {};
            return get(url, params, headers);
        },
        save: function (authToken, title, description, identifier) {
            let url = baseURl + '/services/rs/v1/forwards/permission/edit';
            let headers = {"x-auth-token": authToken};
            let params = {
                title: title,
                description: description,
                identifier: identifier
            };
            return post(url, params, headers);
        }
    };

    this.forwards = {
        load: function (authToken) {
            let url = baseURl + '/services/rs/v1/forwards/list';
            let headers = {"x-auth-token": authToken};
            let params = {};
            return get(url, params, headers);
        },
        save: function (authToken, source, destination, permissions, identifier) {
            let url = baseURl + '/services/rs/v1/forwards/forward';
            let headers = {"x-auth-token": authToken};
            let params = {
                source: source,
                destination: destination,
                permissions: permissions,
                identifier: identifier
            };
            return post(url, params, headers);
        }
    };

    this.ontology = {
        classTree: function (root, depth, label) {
            let url = 'http://dmls.iust.ac.ir:8090/ontology/rest/v1/classTree';
            // let headers = {"x-auth-token": authToken};
            let params = {
                root: root,
                depth: depth,
                label: label === undefined ? true : label
            };
            return get(url, params);
        },
        queryClasses: function (keyword) {
            let url = 'http://dmls.iust.ac.ir:8090/ontology/rest/v1/classes';
            let params = {
                page: 0,
                pageSize: 1000,
                keyword: keyword
            };
            return get(url, params);
        },
        getClass: function (classUrl) {
            let url = 'http://dmls.iust.ac.ir:8090/ontology/rest/v1/classData';
            let params = {
                classUrl: classUrl
            };
            return get(url, params);
        },
        saveClass: function (clazz) {
            let url = 'http://dmls.iust.ac.ir:8090/ontology/rest/v1/saveClass';
            let params = clazz;
            return post(url, params);
        },

        queryProperties: function (keyword, page, pageSize) {
            let url = 'http://dmls.iust.ac.ir:8090/ontology/rest/v1/properties';
            let params = {
                page: page || 0,
                pageSize: pageSize || 20,
                keyword: keyword || undefined
            };
            return get(url, params);
        },
        getProperty: function (propertyUrl) {
            let url = 'http://dmls.iust.ac.ir:8090/ontology/rest/v1/propertyData';
            let params = {
                propertyData: propertyUrl
            };
            return get(url, params);
        },
        saveProperty: function (property) {
            let url = 'http://dmls.iust.ac.ir:8090/ontology/rest/v1/saveProperty';
            let params = property;
            return post(url, params);
        }

    };

    this.mappings = {
        searchTemplate: function (query) {
            let url = 'http://dmls.iust.ac.ir:8090/mapping/rest/v2/search';
            let params = {
                page: query.page,
                pageSize: query.pageSize,
                templateName: query.templateName || undefined,
                templateNameLike: query.templateName ? query.templateNameLike : undefined,
                className: query.className || undefined,
                classNameLike: query.className ? query.classNameLike : undefined,
                propertyName: query.propertyName || undefined,
                propertyNameLike: query.propertyName ? query.propertyNameLike : undefined,
                predicateName: query.predicateName || undefined,
                predicateNameLike: query.predicateName ? query.predicateNameLike : undefined,
                approved: query.approved
            };
            return get(url, params);
        },
        searchProperty: function (query) {
            let url = 'http://dmls.iust.ac.ir:8090/mapping/rest/v2/searchProperty';
            let params = {
                page: query.page,
                pageSize: query.pageSize,
                templateName: query.templateName || undefined,
                templateNameLike: query.templateName ? query.templateNameLike : undefined,
                className: query.className || undefined,
                classNameLike: query.className ? query.classNameLike : undefined,
                propertyName: query.propertyName || undefined,
                propertyNameLike: query.propertyName ? query.propertyNameLike : undefined,
                predicateName: query.predicateName || undefined,
                predicateNameLike: query.predicateName ? query.predicateNameLike : undefined,
                allNull: query.allNull,
                oneNull: query.oneNull,
                approved: query.approved
            };
            return get(url, params);
        }
    };

}]);

let loading = {
    show: function () {
        $('#loading').remove();
        $('body').append('<div id="loading" class="loading"><span>در حال تبادل اطلاعات ...</span></div>');
        $('#loading').fadeIn();
    },
    hide: function () {
        $('#loading').fadeOut();
    }
};
