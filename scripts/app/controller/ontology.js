app
    .controller('OntologyController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {

    })

    .controller('OntologyTreeController', function ($scope, RestService, $cookieStore, $mdDialog, $location) {
        $scope.lang = 'FA';

        $scope.load = function () {

            RestService.ontology.classTree(undefined, 2)
            // RestService.ontology.classTree()
                .then(function (response) {
                    let items = response.data;
                    // items.map(i=> i.label = '*'+i.label+'/*');

                    $scope.items = items;

                    // console.log(items);
                });
        };

        $scope.load();
    })

    .controller('OntologyClassController', function ($scope, RestService, $state, $stateParams, $timeout, $q, $log) {

        let classUrl = $stateParams.classUrl;

        $scope.load = function () {

            self.states = loadAll();
            self.querySearch = querySearch;
            self.selectedItemChange = selectedItemChange;
            self.searchTextChange = searchTextChange;

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

        $scope.save = function (ev) {
            console.log($scope.clazz);
            RestService.ontology.saveClass($scope.clazz)
                .then(function (status) {
                    if (status)
                        $state.go('ontology.class', {classUrl: $scope.clazz.url});
                    else
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.querySelector('body')))
                                .clickOutsideToClose(true)
                                .title('خطا')
                                .textContent('خطایی رخ داده است!')
                                .ariaLabel('ERROR')
                                .ok('خب')
                                .targetEvent(ev)
                        );
                });
        };

        function querySearch(query) {
            var results = query ? self.states.filter(createFilterFor(query)) : self.states,
                deferred;
            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function searchTextChange(text) {
            $log.info('Text changed to ' + text);
        }

        function selectedItemChange(item) {
            $log.info('Item changed to ' + JSON.stringify(item));
        }

        function loadAll() {
            var all = '';

            return all.split(/, +/g).map(function (item) {
                return {
                    value: item.toLowerCase(),
                    display: item
                };
            });
        }

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

        $scope.save = function (ev) {
            console.log($scope.property);

            RestService.ontology.saveProperty($scope.property)
                .then(function (status) {
                    if (status)
                        $state.go('ontology.property', {propertyUrl: $scope.property.url});
                    else
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.querySelector('body')))
                                .clickOutsideToClose(true)
                                .title('خطا')
                                .textContent('خطایی رخ داده است!')
                                .ariaLabel('ERROR')
                                .ok('خب')
                                .targetEvent(ev)
                        );
                });
        };


        $scope.load();
    });
