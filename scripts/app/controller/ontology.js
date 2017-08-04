app
    .controller('OntologyController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {

    })

    .controller('OntologyTreeController', function ($scope, RestService, $state, ivhTreeviewMgr) {
        $scope.lang = 'fa';
        // $scope.lang = 'en';
        $scope.view = 'SIMPLE';
        // $scope.view = 'GRAPHICAL';

        $scope.expandAll = function () {
            ivhTreeviewMgr.expandRecursive($scope.items, $scope.items);
        };

        $scope.collapseAll = function () {
            ivhTreeviewMgr.collapseRecursive($scope.items, $scope.items);
        };

        // $scope.expandTo = function (level) {
        //     ivhTreeviewMgr.collapseRecursive($scope.items, $scope.items);
        // };

        $scope.switchView = function () {
            $scope.view = ($scope.view === 'SIMPLE') ? 'GRAPHICAL' : 'SIMPLE';

            $scope.load();
        };

        $scope.switchLanguage = function (lang) {
            $scope.lang = lang;
            $scope.items = undefined;
            $scope.load();
        };

        $scope.load = function () {

            // RestService.ontology.classTree($scope.lang, undefined, 2)
            RestService.ontology.classTree($scope.lang)
                .then(function (response) {
                    let items = response.data;
                    $scope.items = items;
                    //renderTree(angular.copy($scope.items), $state);

                    if ($scope.view === 'GRAPHICAL')
                        setTimeout(function () {
                            renderTree(angular.copy($scope.items), $state);
                        }, 100);
                });
        };

        $scope.load();
    })

    .controller('OntologyClassController', function ($scope, RestService, $state, $stateParams, $rootScope, $mdDialog) {

        let classUrl = $stateParams.classUrl;

        $scope.load = function () {
            $rootScope.title = classUrl ? 'ویرایش کلاس' : 'ایجاد کلاس جدید';
            if (classUrl) {

                RestService.ontology.getClass(classUrl)
                    .then(function (response) {
                        let clazz = response.data;
                        $scope.clazz = response.data;
                    });
            }
            else {
                //console.log('add new class');
                $scope.clazz = {
                    "disjointWith": [],
                    "equivalentClasses": [],
                    "properties": [],
                };
                $scope.addNew = true;
            }
        };

        $scope.prevClass = function () {
            $state.go('ontology.class', {classUrl: $scope.clazz.previous});
        };

        $scope.nextClass = function () {
            $state.go('ontology.class', {classUrl: $scope.clazz.next});
        };

        $scope.saveClass = function (ev) {
            //console.log($scope.clazz);
            RestService.ontology.saveClass($scope.clazz)
                .then(function (status) {
                    if (status) {
                        $state.go('ontology.class', {classUrl: $scope.clazz.url});
                    }
                    else {
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
                    }
                });
        };

        $scope.cancel = function () {
            if ($scope.addNew)
                $state.go('ontology.tree');
            else
                $state.go('ontology.class', {classUrl: $scope.clazz.url});
        };

        $scope.removeProperty = function (property) {
            let pos = $scope.clazz.properties.indexOf(property);
            $scope.clazz.properties.splice(pos, 1);
        };

        $scope.newProperty = function (ev) {

            $mdDialog.show({
                controller: DialogController,
                // scope: $scope,
                // preserveScope: true,
                templateUrl: './templates/ontology/property-selector.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            }).then(function (data) {
                //console.log(data.property);
                $scope.clazz.properties.push(data.property);
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });

        };

        $scope.queryClasses = function (query) {
            //console.log('queryClasses : ', query);
            return RestService.ontology.queryClasses(query)
                .then(function (response) {
                    return response.data.data;
                });
        };

        $scope.load();


        function DialogController($scope, $mdDialog) {

            $scope.property = {};

            $scope.closeDialog = function () {
                $mdDialog.cancel();
            };

            $scope.queryProperties = function (query) {
                //console.log('queryProperties : ', query);
                return RestService.ontology.queryProperties(query)
                    .then(function (response) {
                        return response.data.data;
                    });
            };

            $scope.selectProperty = function (propertyUrl) {
                RestService.ontology.getProperty(propertyUrl)
                    .then(function (data) {
                        $mdDialog.hide({property: data.data});
                    });
            };

            $scope.addProperty = function (property) {
                $mdDialog.hide({property: property});

                // RestService.ontology.saveProperty(property)
                //     .then(function (status) {
                //         if (status) {
                //             $state.go('ontology.class-edit', {classUrl: $scope.clazz.url});
                //         }
                //         else {
                //             $mdDialog.show(
                //                 $mdDialog.alert()
                //                     .parent(angular.element(document.querySelector('body')))
                //                     .clickOutsideToClose(true)
                //                     .title('خطا')
                //                     .textContent('خطایی رخ داده است!')
                //                     .ariaLabel('ERROR')
                //                     .ok('خب')
                //                     .targetEvent(ev)
                //             );
                //         }
                //     });
            };
        }
    })

    .controller('OntologyPropertyController', function ($scope, RestService, $state, $stateParams, $mdDialog) {

        let propertyUrl = $stateParams.propertyUrl;

        $scope.load = function () {
            RestService.ontology.getProperty(propertyUrl)
                .then(function (response) {
                        let _property = response.data;

                        // $scope.data = {
                        //     property: _property
                        // };

                        if (!_property.domains[0]) {
                            $scope.data = {
                                property: _property
                            };
                        }
                        else {
                            RestService.ontology.getClass(_property.domains[0])
                                .then(function (res) {
                                    let _clazz = res.data;

                                    let index = _.findIndex(_clazz.properties, {url: _property.url});
                                    let previous = (_clazz.properties[index - 1] || {}).url;
                                    let next = (_clazz.properties[index + 1] || {}).url;

                                    $scope.data = {
                                        property: _property,
                                        next: next,
                                        previous: previous
                                    };
                                });
                        }

                    }
                );
        };

        $scope.prevProperty = function () {
            $state.go('ontology.property', {propertyUrl: $scope.previous});
        };

        $scope.nextProperty = function () {
            $state.go('ontology.property', {propertyUrl: $scope.next});
        };


        $scope.addProperty = function (property, ev) {
            RestService.ontology.saveProperty($scope.data.property)
                .then(function (status) {
                    if (status)
                        $state.go('ontology.property', {propertyUrl: $scope.data.property.url});
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

        $scope.cancel = function (ev) {
            $state.go('ontology.property', {propertyUrl: $scope.data.property.url});
        };

        $scope.load();
    });
