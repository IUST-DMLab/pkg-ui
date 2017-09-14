app
    .controller('MappingsController', function ($scope, RestService, $state) {
        $scope.getSelectedTabIndex = function () {
            return $state.current.data.index;
        };
    })

    .controller('MappingsTemplateController', function ($scope, RestService, $state, $stateParams, $rootScope, $mdPanel) {

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

            let position = $mdPanel.newPanelPosition()
                .absolute()
                .center();

            $mdPanel.open({
                attachTo: angular.element(document.body),
                controller: DialogController,
                disableParentScroll: false,
                templateUrl: './templates/mappings/template-item.html',
                hasBackdrop: true,
                panelClass: 'dialog-panel-big',
                position: position,
                trapFocus: true,
                zIndex: 50,
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true,
                locals: {
                    item: item
                }
            })
                .then(function (p) {
                    _dialogPanels['main-panel'] = p;
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
                        pageCount: response.data.pageCount,
                        pageSize: response.data.pageSize,
                        totalSize: response.data.totalSize
                    }
                })
                .catch(function (err) {
                    $scope.items = undefined;
                    $scope.loaded = false;
                    $scope.err = err;
                });
        };

        // $scope.load();

        function DialogController($scope, $mdPanel, item) {
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

                // console.log($scope.selectedItem);
                RestService.mappings.saveTemplate($scope.selectedItem)
                    .then(function () {

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

            $scope.ignore = function (row, index) {
                row.predicate = 'NULL';
            };

            $scope.close = function () {
                closeDialogPanel('main-panel');
            };

            $scope.suggestPredicates = function (query) {
                return RestService.mappings.suggestPredicates(query);
            };

            $scope.suggestUnits = function (query) {
                return RestService.mappings.suggestUnits(query);
            };

            $scope.suggestTransforms = function (query) {
                return RestService.mappings.suggestTransforms(query);
            };


            $scope.filterProperty = function (row, ev) {

                let query = {
                    propertyName: row.property,
                    propertyNameLike: false
                };

                let position = $mdPanel.newPanelPosition()
                    .absolute()
                    .center();

                $mdPanel.open({
                    attachTo: angular.element(document.body),
                    controller: FilterDialogController,
                    disableParentScroll: false,
                    templateUrl: './templates/mappings/property-filter.html',
                    hasBackdrop: true,
                    panelClass: 'dialog-panel-small',
                    position: position,
                    trapFocus: true,
                    zIndex: 51,
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    focusOnOpen: true,
                    locals: {
                        query: query
                    }
                })
                    .then(function (p) {
                        _dialogPanels['filter-panel'] = p;
                    });


                function FilterDialogController($scope, $mdPanel, query) {

                    $scope.load = function () {
                        RestService.mappings.searchTemplate(query)
                            .then((response) => {
                                $scope.property = row.property;
                                $scope.predicate = row.predicate;
                                $scope.items = response.data.data;
                                $scope.loaded = true;
                                $scope.err = undefined;
                            })
                            .catch(function (err) {
                                $scope.items = undefined;
                                $scope.loaded = false;
                                $scope.err = err;
                            });
                    };

                    $scope.close = function () {
                        closeDialogPanel('filter-panel');
                    };


                    $scope.load();
                }
            };

            $scope.editConstant = function (ev, action, index) {
                /*$mdDialog
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

                 });*/

                function save(data) {
                    if (action === 'add') {
                        $scope.selectedItem.rules.push(data.model);
                    }
                    else if (action === 'edit') {
                        $scope.selectedItem.rules[index] = angular.copy(data.model)
                    }

                    //console.log($scope.selectedItem);
                    RestService.mappings.saveTemplate($scope.selectedItem)
                        .then(function () {
                            // $mdDialog.cancel();
                        });
                }


                $mdPanel.open({
                    attachTo: angular.element(document.body),
                    controller: EditConstantDialogController,
                    disableParentScroll: false,
                    templateUrl: './templates/mappings/template-constant-edit.html',
                    hasBackdrop: true,
                    panelClass: 'dialog-panel-thin',
                    position: $mdPanel.newPanelPosition().absolute().center(),
                    trapFocus: true,
                    zIndex: 52,
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    focusOnOpen: true,
                    locals: {
                        title: action === 'add' ? 'افزودن ثابت جدید' : 'ویرایش ثابت',
                        model: action === 'add' ? {} : angular.copy($scope.selectedItem.rules[index]),
                        onClose : function(data){
                            save(data);
                        }
                    }
                })
                    .then(function (p) {
                        _dialogPanels['edit-constant-panel'] = p;
                    });

            };

            function EditConstantDialogController($scope, title, model, onClose) {
                $scope.action = {
                    title: title
                };

                $scope.model = model;

                $scope.suggestPredicates = function (query) {
                    return RestService.mappings.suggestPredicates(query);
                };

                $scope.save = function () {
                    //$mdDialog.hide({model: model, action: 'add'});
                    closeDialogPanel('edit-constant-panel', onClose, {model: model, action: 'add'});
                };

                $scope.close = function () {
                    closeDialogPanel('edit-constant-panel');
                };
            }
        }
    })

    .controller('MappingsPropertyController', function ($scope, RestService) {

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
                        pageCount: response.data.pageCount,
                        pageSize: response.data.pageSize,
                        totalSize: response.data.rowCount
                    }
                })
                .catch(function (err) {
                    $scope.items = undefined;
                    $scope.loaded = false;
                    $scope.err = err;
                });
        };

        $scope.diffArrays = function (a, b) {
            return _.differenceWith(a, b, _.isEqual);
        };


        // $scope.load();
    });

