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

            let rulesAndRecommendations = [];
            for (let p of item.properties) {
                for (let r of p.rules) {
                    rulesAndRecommendations.push(_.assign({property: p.property, valid: true}, r));
                }
            }
            for (let p of item.properties) {
                for (let r of p.recommendations) {
                    rulesAndRecommendations.push(_.assign({property: p.property, valid: false}, r));
                }
            }

            $scope.selectedItem = item;
            $scope.selectedItemPropertyRulesAndRecommendations = rulesAndRecommendations;

            $scope.getTemplate = function (row) {
                if (row.editing)
                    return './templates/mappings/template-item-rule-edit.html';
                else
                    return './templates/mappings/template-item-rule.html';
            };

            $scope.save = (row, index) => {
                row.editing = false;

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

                let items = $scope.selectedItemPropertyRulesAndRecommendations;

                let rules = items.filter(r => r.valid);
                let recommendations = items.filter(r => !r.valid);

                for (let p of $scope.selectedItem.properties) {
                    p.template = undefined; // todo : must be fixed on server side
                    p.rules = translate(rules.filter(r => r.property === p.property));
                    p.recommendations = translate(recommendations.filter(r => r.property === p.property));
                }
                $scope.selectedItem.creationEpoch = undefined; // todo : must be fixed on server side
                $scope.selectedItem.modificationEpoch = undefined; // todo : must be fixed on server side

                console.log($scope.selectedItem);

                RestService.mappings.saveTemplate($scope.selectedItem)
                    .then(function () {
                        // $mdDialog.hide();
                    });
            };

            $scope.edit = function (row, index) {
                $scope.backup = angular.copy($scope.selectedItemPropertyRulesAndRecommendations[index]);
                row.editing = true;
            };

            $scope.cancel = function (row, index) {
                row.editing = false;
                $scope.selectedItemPropertyRulesAndRecommendations[index] = $scope.backup;
                $scope.backup = undefined;
            };

            $scope.close = function () {
                $mdDialog.hide();
            };

            $scope.suggestPredicate = function (query) {
                return RestService.mappings.predicatesSearch(query);
            };


            $scope.editConstant = function (ev, action, index) {
                $mdDialog
                    .show({
                        controller: EditConstantDialogController,
                        multiple: true,
                        locals: {
                            title: action === 'add' ? 'افزودن ثابت جدید' : 'ویرایش ثابت',
                            model: action === 'add' ? {} : angular.copy($scope.selectedItem.rules[index])
                        },
                        templateUrl: './templates/mappings/template-constant-edit.html',
                        parent: angular.element(document.body),
                        targetEvent: ev
                    })
                    .then(function (data) {
                        if (action === 'add') {
                            $scope.selectedItem.rules.push(data.model);
                        }
                        else if (action === 'edit') {
                            $scope.selectedItem.rules[index] = angular.copy(data.model)
                        }

                        console.log($scope.selectedItem);

                        RestService.mappings.saveTemplate($scope.selectedItem)
                            .then(function () {
                                // $mdDialog.cancel();
                            });

                    }, function () {

                    });
            };

            function EditConstantDialogController($scope, $mdDialog, title, model) {
                $scope.action = {
                    title: title
                };

                $scope.model = model;

                $scope.suggestPredicate = function (query) {
                    return RestService.mappings.predicatesSearch(query);
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
