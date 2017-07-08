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
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
        })
        .state('services', {
            abstract: true,
            url: '/services',
        })
        .state('services.ontology', {
            url: '/ontology',
            templateUrl: 'templates/ontology/class-tree.html',
            controller: 'OntologyController'
        });

    $urlRouterProvider.when('', '/home');
    $urlRouterProvider.when('/', '/home');
    $urlRouterProvider.otherwise('/home');
});

app.run(function ($trace) {
    $trace.enable('TRANSITION');

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

app.filter('triple', function () {
    return function (subject) {
        return 'http://194.225.227.161/mapping/html/triple.html?subject=' + subject;
    };
});

app.factory('loginInterceptor', function ($q, $location) {
    return {
        'response': function (response) {
            if (typeof response.data === 'string' && response.data.indexOf('action="/login"') > -1) {
                console.log("LOGIN REQUIRED!!");
                //console.log(response);
                $location.path("/login");
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
        defaultSelectedState: false,
        validate: true,
        expandToDepth: -1,
        twistieCollapsedTpl: '<md-icon md-svg-icon="https://raw.githubusercontent.com/ankoh/mendeley-cache-client/master/app/assets/svg/material-icons/ic_chevron_right_black_24px.svg"></md-icon>',
        twistieExpandedTpl: '<md-icon md-svg-icon="https://raw.githubusercontent.com/ankoh/mendeley-cache-client/master/app/assets/svg/material-icons/ic_expand_more_black_24px.svg"></md-icon>',
        twistieLeafTpl: '<span style="cursor: default;">&#8192;&#8192;</span>'
    });
});
app.directive('mdBox', function (ivhTreeviewMgr) {
    return {
        restrict: 'AE',
        template: [
            '<span class="ascii-box">',
            '<span ng-show="node.selected" class="x"><md-checkbox style="min-height: 100%; line-height: 0" aria-label="checked" ng-checked="true"></md-checkbox></span>',
            '<span ng-show="node.__ivhTreeviewIndeterminate" class="y"><md-checkbox style="min-height: 100%; line-height: 0" aria-label="checked" ng-checked="false"></md-checkbox></span>',
            '<span ng-hide="node.selected || node.__ivhTreeviewIndeterminate"><md-checkbox style="min-height: 100%; line-height: 0" aria-label="checked" ng-checked="false"></md-checkbox></span>',
            '</span>',
        ].join(''),
        link: function (scope, element, attrs) {
            element.on('click', function () {
                ivhTreeviewMgr.select(stuff, scope.node, !scope.node.selected);
                scope.$apply();
            });
        }
    };
});