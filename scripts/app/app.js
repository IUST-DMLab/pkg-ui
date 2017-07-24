let app = angular.module('KnowledgeGraphApp', ['ui.router', 'ngMaterial', 'md.data.table',
    'ngAnimate', 'ngAria', 'ngMessages', 'ngCookies', 'ngMdIcons',
    'ivh.treeview', 'ncy-angular-breadcrumb', 'cl.paging']);

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state('user', {
            url: '/user',
            abstract: true,
            templateUrl: 'templates/layout.html',
            // controller: 'UserController'
        })
        .state('user.profile', {
            url: '/profile',
            templateUrl: 'templates/user/profile.html',
            controller: 'UserController',
            data: {index: 0},
            ncyBreadcrumb: {
                label: 'پروفایل',
                parent: 'home.dashboard'
            }
        })
        .state('user.password', {
            url: '/password',
            templateUrl: 'templates/user/password.html',
            controller: 'UserController',
            data: {index: 0},
            ncyBreadcrumb: {
                label: 'تغییر کلمه‌عبور',
                parent: 'home.dashboard'
            }
        })

        .state('home', {
            url: '/home',
            abstract: true,
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
        })
        .state('home.dashboard', {
            url: '/dashboard',
            templateUrl: 'templates/dashboard.html',
            controller: 'HomeController',
            data: {index: 0},
            ncyBreadcrumb: {
                label: 'خانه'
            }
        })
        .state('home.users', {
            url: '/users',
            templateUrl: 'templates/users/list.html',
            controller: 'HomeController',
            data: {index: 1},
            ncyBreadcrumb: {
                label: 'کاربران',
                parent: 'home.dashboard'
            }
        })
        .state('home.permissions', {
            url: '/permissions',
            templateUrl: 'templates/permissions/list.html',
            controller: 'HomeController',
            data: {index: 2},
            ncyBreadcrumb: {
                label: 'دسترسی‌ها',
                parent: 'home.dashboard'
            }
        })
        .state('home.forwards', {
            url: '/forwards',
            templateUrl: 'templates/forwards/list.html',
            controller: 'HomeController',
            data: {index: 3},
            ncyBreadcrumb: {
                label: 'فورواردها',
                parent: 'home.dashboard'
            }
        })

        .state('ontology', {
            abstract: true,
            url: '/ontology',
            templateUrl: 'templates/ontology/ontology.html',
            controller: 'OntologyController',
            // ncyBreadcrumb: {
            //     label: 'هستان‌شناسی',
            //     parent: 'home.dashboard'
            // }
        })
        .state('ontology.tree', {
            url: '/tree',
            templateUrl: 'templates/ontology/tree.html',
            controller: 'OntologyTreeController',
            ncyBreadcrumb: {
                label: 'هستان‌شناسی',
                parent: 'home.dashboard'
            }
        })
        .state('ontology.class', {
            url: '/class/:classUrl',
            templateUrl: 'templates/ontology/class.html',
            controller: 'OntologyClassController',
            ncyBreadcrumb: {
                label: 'کلاس',
                parent: 'ontology.tree'
            }
        })
        .state('ontology.class-edit', {
            url: '/class-edit/:classUrl',
            templateUrl: 'templates/ontology/class-edit.html',
            controller: 'OntologyClassController',
            ncyBreadcrumb: {
                label: '{{title}}',
                parent: 'ontology.tree'
            }
        })
        .state('ontology.property', {
            url: '/property/:propertyUrl',
            templateUrl: 'templates/ontology/property.html',
            controller: 'OntologyPropertyController',
            ncyBreadcrumb: {
                label: 'خصیصه',
                parent: 'ontology.tree'
            }
        })
        .state('ontology.property-edit', {
            url: '/property-edit/:propertyUrl',
            templateUrl: 'templates/ontology/property-edit.html',
            controller: 'OntologyPropertyController',
            ncyBreadcrumb: {
                label: 'ویرایش خصیصه',
                parent: 'ontology.tree'
            }
        })

        .state('mappings', {
            abstract: true,
            url: '/mappings',
            templateUrl: 'templates/mappings/mappings.html',
            controller: 'MappingsController',
        })
        .state('mappings.template', {
            url: '/template',
            templateUrl: 'templates/mappings/template.html',
            controller: 'MappingsTemplateController',
            data: {index: 0},
            ncyBreadcrumb: {
                label: 'نگاشت الگو',
                parent: 'home.dashboard'
            }
        })
        .state('mappings.property', {
            url: '/property',
            templateUrl: 'templates/mappings/property.html',
            controller: 'MappingsPropertyController',
            data: {index: 1},
            ncyBreadcrumb: {
                label: 'نگاشت خصیصه',
                parent: 'home.dashboard'
            }
        });

    $urlRouterProvider.when('', '/home/dashboard');
    $urlRouterProvider.when('/', '/home/dashboard');
    // $urlRouterProvider.when('/home', '/home/dashboard');
    $urlRouterProvider.otherwise('/home/dashboard');

    $httpProvider.interceptors.push('loginInterceptor');

});

app.filter("mapPrefix", function (RestService) {
    let prefixes = null, // DATA RECEIVED ASYNCHRONOUSLY AND CACHED HERE
        serviceInvoked = false;

    function realFilter(text) { // REAL FILTER LOGIC
        if (!text) return text;
        for (let link in prefixes) {
            let p = prefixes[link];
            if (text.indexOf(link) !== -1)
                return p + ':' + text.replace(link, '');
        }
        return text;
    }

    filterStub.$stateful = true;
    function filterStub(value) { // FILTER WRAPPER TO COPE WITH ASYNCHRONICITY
        if (prefixes === null) {
            if (!serviceInvoked) {
                serviceInvoked = true;
                // CALL THE SERVICE THAT FETCHES THE DATA HERE
                RestService.getPrefixes().then(function (result) {
                    prefixes = result.data;
                });
            }
            return ""; // PLACEHOLDER WHILE LOADING, COULD BE EMPTY
        }
        else
            return realFilter(value);
    }

    return filterStub;
});

app.filter("extractLastUrlItem", function () {
    function extractLastUrlItem(url) {
        if (!url || url.indexOf('/') === -1) return '';
        return url.split('/').pop();
    }

    return extractLastUrlItem;
});

app.filter('triple', function () {
    return function (subject) {
        return 'http://194.225.227.161/mapping/html/triple.html?subject=' + subject;
    };
});

app.factory('loginInterceptor', function ($q, $state) {
    return {
        'response': function (response) {
            if (typeof response.data === 'string' && response.data.indexOf('action="/login"') > -1) {
                console.log("LOGIN REQUIRED!!");
                //console.log(response);
                $state.go("login");
                return $q.reject(response);
            }
            else {
                return response;
            }
        }
    }
});

app.config(function (ivhTreeviewOptionsProvider) {
    ivhTreeviewOptionsProvider.set({
        idAttribute: 'id',
        labelAttribute: 'label',
        childrenAttribute: 'children',
        selectedAttribute: 'selected',
        useCheckboxes: false,
        expandToDepth: 0,
        indeterminateAttribute: '__ivhTreeviewIndeterminate',
        expandedAttribute: '__ivhTreeviewExpanded',
        defaultSelectedState: true,
        validate: true,
        twistieCollapsedTpl: '<md-icon md-svg-icon="./styles/svg/ic_chevron_left_black_24px.svg"></md-icon>',
        twistieExpandedTpl: '<md-icon md-svg-icon="./styles/svg/ic_expand_more_black_24px.svg"></md-icon>',
        twistieLeafTpl: '<span style="cursor: default;">&#8192;&#8192;</span>'

        // twistieExpandedTpl: '<span class="fa fa-1x fa-minus"></span>',
        // twistieCollapsedTpl: '<span class="fa fa-1x fa-plus"></span>',
        // twistieLeafTpl: ''
    });
});

app.config(function ($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
        prefixStateName: 'home',
        template: 'bootstrap2',
        // includeAbstract: true,
        //templateUrl:'./templates/breadcrumb.html'
    });
});

app.directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val() === $(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                });
            });
        }
    }
}]);