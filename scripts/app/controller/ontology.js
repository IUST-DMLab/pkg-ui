app
    .controller('OntologyController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {

    })

    .controller('OntologyTreeController', function ($scope, RestService, $state, ivhTreeviewMgr) {
        $scope.lang = 'FA';
        $scope.type = 'SIMPLE';
        // $scope.type = 'GRAPHICAL';

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
            $scope.type = $scope.type === 'SIMPLE' ? 'GRAPHICAL' : 'SIMPLE';
        };


        $scope.load = function () {

            // RestService.ontology.classTree(undefined, 1)
            RestService.ontology.classTree()
                .then(function (response) {
                    let items = response.data;
                    $scope.items = items;

                    dndTree(items, $state);
                });

        };

        $scope.load();
    })

    .controller('OntologyClassController', function ($scope, RestService, $state, $stateParams, $rootScope, $mdDialog) {

        let classUrl = $stateParams.classUrl;

        $scope.load = function () {
            $rootScope.title = classUrl ? 'ویرایش کلاس' : 'ایجاد کلاس جدید';
            if (classUrl) {
                //console.log('edit class : ', classUrl);
                RestService.ontology.getClass(classUrl)
                    .then(function (response) {
                        let clazz = response.data;
                        $scope.clazz = response.data;
                        // if (clazz.subClassOf) {
                        //     RestService.ontology.getClass(clazz.subClassOf)
                        //         .then(function (response2) {
                        //             $scope.clazz = response.data;
                        //             $scope.parent = response2.data;
                        //         });
                        // }
                        // else {
                        //     $scope.clazz = response.data;
                        //     $scope.parent = undefined;
                        // }
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

    .controller('OntologyPropertyController', function ($scope, RestService, $state, $stateParams, $mdDialog, $location) {

        let propertyUrl = $stateParams.propertyUrl;

        $scope.load = function () {
            RestService.ontology.getProperty(propertyUrl)
                .then(function (response) {
                    $scope.property = response.data;
                });
        };

        $scope.addProperty = function (property, ev) {
            // console.log(222);
            // console.log($scope.property);

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

        $scope.cancel = function (ev) {
            $state.go('ontology.property', {propertyUrl: $scope.property.url});
        };

        $scope.load();
    });
