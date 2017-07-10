app
    .controller('OntologyController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {

        // $scope.load = function () {
        //     let authToken = $cookieStore.get('authToken');
        //
        //     $scope.username = $cookieStore.get('username');
        //     $scope.roles = $cookieStore.get('roles');
        // };
        //
        // $scope.logout = function () {
        //     $cookieStore.put('authToken', '');
        //     $cookieStore.put('roles', '');
        //     $cookieStore.put('username', '');
        //     $scope.authenticated = false;
        //
        //     $state.go("login");
        // };
        //
        // // **
        //
        // $scope.load();
    })

    .controller('OntologyTreeController', function ($scope, RestService, $cookieStore, $mdDialog, $location) {

        $scope.load = function () {

            //RestService.ontology.classTree(undefined, 2)
            RestService.ontology.classTree()
                .then(function (response) {
                    let items = response.data;
                    // items.map(i=> i.label = '*'+i.label+'/*');

                    $scope.items = items;

                    // console.log(items);
                });
        };

        $scope.load();
    })

    .controller('OntologyClassController', function ($scope, RestService, $state, $stateParams, $mdDialog, $location) {

        let classUrl = $stateParams.classUrl;

        $scope.load = function () {
            RestService.ontology.getClass(classUrl)
                .then(function (response) {
                    let clazz = response.data;
                    if (clazz.subClassOf) {
                        RestService.ontology.getClass(clazz.subClassOf)
                            .then(function (response2) {
                                $scope.clazz = response.data;
                                $scope.parent = response2.data;
                            });
                    }
                    else {
                        $scope.clazz = response.data;
                        $scope.parent = undefined;
                    }
                });
        };


        $scope.load();
    })

    .controller('OntologyPropertyController', function ($scope, RestService, $state, $stateParams, $mdDialog, $location) {

        let propertyUrl = $stateParams.propertyUrl;

        $scope.load = function () {
            RestService.ontology.getProperty(propertyUrl)
                .then(function (response) {
                    $scope.property = response.data;
                });
        };


        $scope.load();
    });
