app
    .controller('ForwardsController', function ($scope, RestService, $cookieStore, $mdDialog, $location) {
        $scope.selected = [];
        $scope.limitOptions = [5, 10, 15];

        $scope.options = {
            rowSelection: true,
            multiSelect: true,
            autoSelect: true,
            decapitate: false,
            largeEditDialog: false,
            boundaryLinks: false,
            limitSelect: true,
            pageSelect: true
        };

        $scope.query = {
            name: '',
            username: '',
            order: 'name',
            limit: 5,
            page: 1
        };

        $scope.load = function () {
            let authToken = $cookieStore.get('authToken');
            $scope.username = $cookieStore.get('username');

            RestService.forwards.load(authToken)
                .then(function (response) {
                    $scope.data = {
                        forwards: response.data.sort(compare)
                    };
                })
                .catch(function (err) {
                    console.log('error : ', err);
                });
        };

        function compare(a, b) {
            if (a.source < b.source)
                return -1;
            if (a.source > b.source)
                return 1;
            return 0;
        }

        $scope.edit = function (forward) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/forwards/edit.html',
                parent: angular.element(document.body),
                locals: {
                    forward: forward
                },
                //targetEvent: ev,
                clickOutsideToClose: true,
            }).then(function (answer) {
                $scope.load();
            }, function () {

            });
        };

        function DialogController($scope, $mdDialog, forward) {
            $scope.newForward = forward ? false : true;
            $scope.forward = forward ? angular.copy(forward) : {};

            $scope.save = function () {
                let authToken = $cookieStore.get('authToken');
                let permissions = [$scope.pExpert ? 'Expert' : '', $scope.pSuperuser ? 'Superuser' : '', $scope.pVIPExpert ? 'VIPExpert' : ''].filter(p => p);
                RestService.forwards.save(authToken, $scope.permission.source, $scope.permission.destination, permissions, $scope.permission.identifier)
                    .then(function (response) {
                        $mdDialog.hide('save');
                    })
                    .catch(function (err) {
                        alert(err);
                        console.log('error : ', err);
                    });
            };

            $scope.cancel = function () {
                $mdDialog.hide('cancel');
            };
        }

        //
        $scope.load();
    });
