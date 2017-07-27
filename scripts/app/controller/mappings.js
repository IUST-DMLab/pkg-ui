app
    .controller('MappingsController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {
        $scope.getSelectedTabIndex = function () {
            return $state.current.data.index;
        };
    })

    .controller('MappingsTemplateController', function ($scope, RestService, $state, $stateParams, $rootScope, $mdDialog) {

        $scope.query = {
            page: 0,
            pageSize: 20,
            templateName: undefined,
            templateNameLike: undefined,
            className: undefined,
            classNameLike: undefined,
            propertyName: undefined,
            propertyNameLike: undefined,
            predicateName: undefined,
            predicateNameLike: undefined,
            approved: ''
        };

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if (!$scope.paging) return;
            $scope.query.page = $scope.paging.current - 1;
            $scope.load();
        };

        $scope.showItem = function (item, ev) {

            $mdDialog.show({
                controller: DialogController,
                templateUrl: './templates/mappings/template-item.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                locals: {
                    item: item
                }
                //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            }).then(function (data) {
                //console.log(data.property);

            }, function () {

            });


        };

        $scope.load = function () {
            RestService.mappings.searchTemplate($scope.query)
                .then((response) => {
                    $scope.items = response.data.data;
                    $scope.loaded = true;
                    $scope.err = undefined;
                    $scope.paging = {
                        pageIndex: response.data.page,
                        current: response.data.page + 1,
                        total: response.data.pageCount,
                        size: response.data.pageSize
                    }
                })
                .catch(function (err) {
                    $scope.items = undefined;
                    $scope.loaded = false;
                    $scope.err = err;
                });
        };

        // $scope.load();

        function DialogController($scope, $mdDialog, item) {
            $scope.action = '';
            var rules = [];
            var recommendations = [];
            for (let p of item.properties) {
                for (let r of p.rules) {
                    rules.push(_.assign({property: p.property, valid: true, editable: true}, r));
                }
                for (let r of p.recommendations) {
                    recommendations.push(_.assign({property: p.property, valid: false, editable: true}, r));
                }
            }

            $scope.selectedItem = item;
            $scope.selectedItemPropertyRules = rules;
            $scope.selectedItemPropertyRecommendations = recommendations;

            $scope.save = (row) => {
                row.edit = !row.edit;

                function translate(items) {
                    return items.map((r) => {
                        return {
                            constant: r.constant,
                            predicate: r.predicate,
                            transform: r.transform,
                            type: r.type,
                            unit: r.unit
                        }
                    });
                }

                let items = $scope.selectedItemPropertyRules.concat($scope.selectedItemPropertyRecommendations);

                var rules = items.filter(r => r.valid);
                var recommendations = items.filter(r => !r.valid);

                for (let p of $scope.selectedItem.properties) {
                    p.template = undefined; // todo : must be fixed on server side
                    p.rules = translate(rules.filter(r => r.property === p.property));
                    p.recommendations = translate(recommendations.filter(r => r.property === p.property));
                }
                $scope.selectedItem.creationEpoch = undefined; // todo : must be fixed on server side
                $scope.selectedItem.modificationEpoch = undefined; // todo : must be fixed on server side

                RestService.mappings.saveTemplate($scope.selectedItem)
                    .then(function () {
                        $mdDialog.hide();
                    });
            };

            $scope.editConstant = function (ev, action, index) {
                $mdDialog
                    .show({
                        controller: EditConstantDialogController,
                        multiple: true,
                        locals: {
                            model: action === 'add' ? {} : angular.copy($scope.selectedItem.rules[$index])
                        },
                        templateUrl: './templates/mappings/template-item-edit.html',
                        parent: angular.element(document.body),
                        targetEvent: ev
                    })
                    .then(function (data) {
                        if (action === 'add') {
                            $scope.selectedItem.rules.push(data.model);
                        }
                        else if (action === 'edit') {
                            $scope.selectedItem.rules[$index] = angular.copy(data.model)
                        }

                        console.log($scope.selectedItem);

                        // RestService.mappings.saveTemplate($scope.selectedItem)
                        //     .then(function () {
                        //         $mdDialog.cancel();
                        //     });

                    }, function () {

                    });
            };

            $scope.saveConstant = function (rule) {
                $scope.action = undefined;
                if ($scope.action === 'editing') {
                    rule = $scope.editingModel;
                }
                else if ($scope.action === 'adding') {
                    $scope.selectedItem.rules.push($scope.editingModel);
                    $scope.editingModel = undefined;
                }
            };

            $scope.cancelConstant = function (rule) {
                $scope.action = '';
                $scope.editingModel = undefined;
            };


            $scope.cancel = function (row) {
                row.edit = !row.edit;
            };

            $scope.close = function () {
                $mdDialog.hide();
            };


            function EditConstantDialogController($scope, $mdDialog, model) {
                $scope.action = {
                    title: 'افزودن ثابت جدید'
                };

                $scope.model = model;

                $scope.querySearch = function (query) {
                    return RestService.mappings.predicatesSearch(query);
                };

                $scope.selectedItemChange = function (item) {
                    $scope.model.predicate = item;
                };

                $scope.save = function () {
                    $mdDialog.hide({model: model, action: 'add'});
                };

                $scope.close = function () {
                    $mdDialog.cancel();
                };
            }

        }
    })

    .controller('MappingsPropertyController', function ($scope, RestService, $state, $stateParams, $mdDialog, $location) {

        $scope.query = {
            page: 0,
            pageSize: 20,
            templateName: undefined,
            templateNameLike: undefined,
            className: undefined,
            classNameLike: undefined,
            propertyName: undefined,
            propertyNameLike: undefined,
            predicateName: undefined,
            predicateNameLike: undefined,
            allNull: '',
            oneNull: '',
            approved: ''
        };

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if (!$scope.paging) return;
            $scope.query.page = $scope.paging.current - 1;
            $scope.load();
        };

        $scope.load = function () {
            RestService.mappings.searchProperty($scope.query)
                .then((response) => {
                    $scope.items = response.data.data;
                    $scope.loaded = true;
                    $scope.err = undefined;
                    $scope.paging = {
                        pageIndex: response.data.page,
                        current: response.data.page + 1,
                        total: response.data.pageCount,
                        size: response.data.pageSize
                    }
                })
                .catch(function (err) {
                    $scope.items = undefined;
                    $scope.loaded = false;
                    $scope.err = err;
                });
        };

        // $scope.load();
    });
