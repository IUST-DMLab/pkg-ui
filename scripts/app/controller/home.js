app
    .controller('HomeController', function ($scope, $location, RestService, $cookieStore, $mdDialog) {

        $scope.load = function () {
            let authToken = $cookieStore.get('authToken');
            $scope.username = $cookieStore.get('username');
            $scope.roles = $cookieStore.get('roles');


        };

        $scope.logout = function () {
            $cookieStore.put('authToken', '');
            $cookieStore.put('roles', '');
            $cookieStore.put('username', '');
            $scope.authenticated = false;

            $location.path( "/login" );
        };

        // **

        $scope.load();
    });
