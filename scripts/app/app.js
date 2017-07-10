let app = angular.module('KnowledgeGraphApp', ['ui.router', 'ngMaterial', 'md.data.table',
    'ngAnimate', 'ngAria', 'ngMessages', 'ngCookies', 'ngMdIcons', 'ivh.treeview']);

/*
 app.config(function ($routeProvider, $locationProvider, $httpProvider) {
 $routeProvider
 .when('/login', {
 templateUrl: 'templates/login.html',
 controller: 'LoginController'
 })
 .when('/home', {
 templateUrl: 'templates/home.html',
 controller: 'HomeController'
 })
 .when('/services/ontology', {
 templateUrl: 'templates/home.html',
 controller: 'HomeController'
 })
 .otherwise({
 redirectTo: '/login'
 });
 //    $locationProvider.html5Mode(true); //Remove the '#' from URL.

 $httpProvider.interceptors.push('loginInterceptor');
 });
 */

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
        })
        .state('home', {
            url: '/home',
            abstract: true,
            templateUrl: 'templates/home.html',
            controller:'HomeController'
        })
        .state('home.dashboard', {
            url: '/dashboard',
            templateUrl: 'templates/dashboard.html',
            controller: 'HomeController',
            data : {index : 0}
        })
        .state('home.users', {
            url: '/users',
            templateUrl: 'templates/users/list.html',
            controller: 'HomeController',
            data : {index : 1}
        })
        .state('home.permissions', {
            url: '/permissions',
            templateUrl: 'templates/permissions/list.html',
            controller: 'HomeController',
            data : {index : 2}
        })
        .state('home.forwards', {
            url: '/forwards',
            templateUrl: 'templates/forwards/list.html',
            controller: 'HomeController',
            data : {index : 3}
        })
        .state('ontology', {
            abstract: true,
            url: '/ontology',
            templateUrl: 'templates/ontology/ontology.html',
            controller:'OntologyController'
        })
        .state('ontology.tree', {
            url: '/tree',
            templateUrl: 'templates/ontology/tree.html',
            controller: 'OntologyTreeController'
        })
        .state('ontology.class', {
            url: '/class/:classUrl',
            templateUrl: 'templates/ontology/class.html',
            controller: 'OntologyClassController'
        })
        .state('ontology.property', {
            url: '/property/:propertyUrl',
            templateUrl: 'templates/ontology/property.html',
            controller: 'OntologyPropertyController'
        });

    $urlRouterProvider.when('', '/home/dashboard');
    $urlRouterProvider.when('/', '/home/dashboard');
    $urlRouterProvider.otherwise('/home/dashboard');
});

// app.run(function ($trace) {
//     $trace.enable('TRANSITION');
// });

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
        useCheckboxes: true,
        expandToDepth: 0,
        indeterminateAttribute: '__ivhTreeviewIndeterminate',
        expandedAttribute: '__ivhTreeviewExpanded',
        defaultSelectedState: true,
        validate: true,
        twistieExpandedTpl: '<span class="fa fa-1x fa-minus"></span>',
        twistieCollapsedTpl: '<span class="fa fa-1x fa-plus"></span>',
        twistieLeafTpl: ''
    });
});
