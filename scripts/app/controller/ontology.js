app
    .controller('OntologyController', function ($scope, RestService, $cookieStore, $mdDialog, $location) {

        $scope.load = function () {

            RestService.ontology.classTree(undefined, 2)
                .then(function(response){
                    $scope.items = response.data;
                    console.log(response.data);
                });



        };


        $scope.load();
    });
