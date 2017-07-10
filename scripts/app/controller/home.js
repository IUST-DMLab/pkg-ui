app
    .controller('HomeController', function ($scope, $state, RestService, $cookieStore, $mdDialog) {


        $scope.getSelectedTabIndex = function () {
            return $state.current.data.index;
        };

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

            $state.go("login");
        };

        // **

        $scope.load();
    });
