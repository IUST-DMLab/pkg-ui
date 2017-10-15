app
    .controller('MappingsController', function ($scope, RestService, $state) {
        $scope.getSelectedTabIndex = function () {
            return $state.current.data.index;
        };
    })

    .controller('MappingsTemplateController', function ($scope, RestService, $state, $stateParams, $rootScope, $mdPanel, $mdDialog) {

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

        // only for demo
        if (document.domain === 'localhost') {
            $scope.query.templateName = 'قنات';
            $scope.query.templateNameLike = true;
        }

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if (!$scope.paging) return;
            $scope.query.page = $scope.paging.current - 1;
            $scope.load();
        };

        $scope.showTemplate = function (ev, template) {

            let position = $mdPanel.newPanelPosition()
                .absolute()
                .center();

            $mdPanel.open({
                attachTo: angular.element(document.body),
                controller: SelectedTemplateDialogController,
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
                    template: template
                }
            })
                .then(function (p) {
                    _dialogPanels['main-panel'] = p;
                });

        };

        $scope.load = function () {
            RestService.mappings.searchTemplate($scope.query)
                .then((response) => {
                    $scope.templates = response.data.data;
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
                    $scope.templates = undefined;
                    $scope.loaded = false;
                    $scope.err = err;
                });
        };

        // $scope.load();

        function SelectedTemplateDialogController($scope, $mdPanel, template) {

            function generateRule(items) {
                return items.map((r) => {
                    return {
                        constant: r.constant,
                        predicate: r.predicate,
                        transform: r.transform ? r.transform.transform : undefined,
                        type: r.type,
                        unit: r.unit
                    }
                });
            }

            for (let p of template.properties) {
                p.list = [];
                for (let r of p.rules) {
                    p.list.push(_.assign({valid: true}, r));
                }
                for (let r of p.recommendations) {
                    p.list.push(_.assign({valid: false}, r));
                }
            }
            //console.log(template);

            $scope.selectedTemplate = template;

            $scope.saveTemplate = (templateToBeSaved) => {

                // function translate(items) {
                //     return items.map((r) => {
                //         return {
                //             constant: r.constant,
                //             predicate: r.predicate,
                //             transform: r.transform ? r.transform.transform : undefined,
                //             type: r.type,
                //             unit: r.unit
                //         }
                //     });
                // }
                //
                // let items = $scope.selectedItemPropertyRulesAndRecommendations;
                // let rules = items.filter(r => r.valid);
                // let recommendations = items.filter(r => !r.valid);
                //
                // for (let p of $scope.selectedTemplate.properties) {
                //     p.template = undefined; // todo : must be fixed on server side
                //     p.rules = translate(rules.filter(r => r.property === p.property));
                //     p.recommendations = translate(recommendations.filter(r => r.property === p.property));
                // }
                // $scope.selectedTemplate.creationEpoch = undefined; // todo : must be fixed on server side
                // $scope.selectedTemplate.modificationEpoch = undefined; // todo : must be fixed on server side

                RestService.mappings.saveTemplate(templateToBeSaved)
                    .then(function () {
                        $scope.selectedTemplate = templateToBeSaved;
                    })
                    .catch(function () {
                        alert('خطایی رخ داده است!');
                    });
            };

            $scope.cancel = function (row, index) {
                $scope.selectedItemPropertyRulesAndRecommendations[index] = $scope.backup;
                $scope.backup = undefined;
            };

            $scope.close = function () {
                closeDialogPanel('main-panel');
            };

            $scope.filterProperty = function (ev, property, predicate) {

                let query = {
                    propertyName: property,
                    propertyNameLike: false
                };

                $mdPanel.open({
                    attachTo: angular.element(document.body),
                    controller: FilterDialogController,
                    disableParentScroll: false,
                    templateUrl: './templates/mappings/property-filter.html',
                    hasBackdrop: true,
                    panelClass: 'dialog-panel-small',
                    position: $mdPanel.newPanelPosition().absolute().center(),
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
                                $scope.property = property;
                                $scope.predicate = predicate;
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


            $scope.removeRule = function (ev, property, rule) {

                let confirm = $mdDialog.confirm({
                    // onComplete: function afterShowAnimation() {
                    //     var $dialog = angular.element(document.querySelector('md-dialog'));
                    //     var $actionsSection = $dialog.find('md-dialog-actions');
                    //     var $cancelButton = $actionsSection.children()[0];
                    //     var $confirmButton = $actionsSection.children()[1];
                    //     angular.element($confirmButton).addClass('md-raised md-warn');
                    //     angular.element($cancelButton).addClass('md-raised');
                    // }
                })
                    .title('آیا واقعا می‌خواهید خصیصه انتخاب شده را حذف کنید؟')
                    .textContent('این عمل قابل بازگشت نمی‌باشد!')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('حذف کن')
                    .cancel('انصراف');

                $mdDialog.show(confirm)
                    .then(function () {

                        let copy = angular.copy($scope.selectedTemplate);
                        let rIndex = property.list.indexOf(rule);
                        let pIndex = $scope.selectedTemplate.properties.indexOf(property);
                        copy.properties[pIndex].list.splice(rIndex, 1);

                        copy.properties[pIndex].rules = generateRule(copy.properties[pIndex].list.filter(r => r.valid));
                        copy.properties[pIndex].recommendations = generateRule(copy.properties[pIndex].list.filter(r => !r.valid));

                        // $scope.selectedTemplate = copy;  // on debug only
                        $scope.saveTemplate(copy);

                    }, function () {

                    });
            };

            $scope.addNewRule = function (ev, property) {
                console.log(property);

                $scope.editRule(ev, property);
                // constant, predicate, transform, type, unit
            };

            $scope.editRule = function (ev, property, rule) {

                $mdPanel.open({
                    attachTo: angular.element(document.body),
                    controller: EditRuleDialogController,
                    disableParentScroll: false,
                    templateUrl: './templates/mappings/template-item-rule-edit.html',
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
                        title: !rule ? 'نگاشت جدید' : 'ویرایش نگاشت',
                        model: {
                            property: property,
                            rule: angular.copy(rule)
                        },
                        onSave: function (data) {

                            let copy = angular.copy($scope.selectedTemplate);
                            let rIndex = property.list.indexOf(rule);
                            let pIndex = $scope.selectedTemplate.properties.indexOf(property);

                            if (rule)   // edit
                                copy.properties[pIndex].list[rIndex] = angular.copy(data);
                            else        // add
                                copy.properties[pIndex].list.push(data);

                            copy.properties[pIndex].rules = generateRule(copy.properties[pIndex].list.filter(r => r.valid));
                            copy.properties[pIndex].recommendations = generateRule(copy.properties[pIndex].list.filter(r => !r.valid));

                            // $scope.selectedTemplate = copy;  // on debug only
                            $scope.saveTemplate(copy);
                        }
                    }
                })
                    .then(function (p) {
                        _dialogPanels['edit-property-panel'] = p;
                    });
            };

            function EditRuleDialogController($scope, title, model, onSave) {

                $scope.action = {
                    title: title
                };

                $scope.model = model;

                // $scope.suggestPredicates = function (query) {
                //     console.log('edit-constant suggestPredicates');
                //     return RestService.mappings.suggestPredicates(query);
                // };

                $scope.suggestPredicates = function (query) {
                    //console.log('dialog-controller suggestPredicates');
                    return RestService.ontology.suggestProperties(query)
                        .then((res) => {
                            return res.data;
                        });
                    //return RestService.mappings.suggestPredicates(query);
                };

                $scope.suggestUnits = function (query) {
                    return RestService.mappings.suggestUnits(query);
                };

                $scope.suggestTransforms = function (query) {
                    return RestService.mappings.suggestTransforms(query)
                        .then(function (data) {
                            if (query)
                                return data.filter(x => (x.transform.indexOf(query) > -1) || (x.label.indexOf(query) > -1));
                            else return data;
                        });
                };

                $scope.save = function () {
                    closeDialogPanel('edit-property-panel', onSave, model.rule);
                };

                $scope.close = function () {
                    closeDialogPanel('edit-property-panel');
                };
            }


            $scope.removeConstant = function (ev, rule) {

                let confirm = $mdDialog.confirm({
                    // onComplete: function afterShowAnimation() {
                    //     var $dialog = angular.element(document.querySelector('md-dialog'));
                    //     var $actionsSection = $dialog.find('md-dialog-actions');
                    //     var $cancelButton = $actionsSection.children()[0];
                    //     var $confirmButton = $actionsSection.children()[1];
                    //     angular.element($confirmButton).addClass('md-raised md-warn');
                    //     angular.element($cancelButton).addClass('md-raised');
                    // }
                })
                    .title('آیا واقعا می‌خواهید ثابت انتخاب شده را حذف کنید؟')
                    .textContent('این عمل قابل بازگشت نمی‌باشد!')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('حذف کن')
                    .cancel('انصراف');

                $mdDialog.show(confirm).then(function () {

                    let index = $scope.selectedTemplate.rules.indexOf(rule);
                    let copy = angular.copy($scope.selectedTemplate);
                    copy.rules.splice(index, 1);
                    $scope.saveTemplate(copy);

                }, function () {
                });

            };

            $scope.editConstant = function (ev, rule) {

                let index = $scope.selectedTemplate.rules.indexOf(rule);

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
                        title: !rule ? 'افزودن ثابت جدید' : 'ویرایش ثابت',
                        model: !rule ? {} : angular.copy($scope.selectedTemplate.rules[index]), // todo : angular.copy(rule)
                        onSave: function (data) {

                            let copy = angular.copy($scope.selectedTemplate);
                            if (rule)   // edit
                                copy.rules[index] = angular.copy(data.model);
                            else        // add
                                copy.rules.push(data.model);

                            $scope.saveTemplate(copy);
                        }
                    }
                })
                    .then(function (p) {
                        _dialogPanels['edit-constant-panel'] = p;
                    });
            };

            function EditConstantDialogController($scope, title, model, onSave) {
                $scope.action = {
                    title: title
                };

                $scope.model = model;

                $scope.suggestPredicates = function (query) {
                    //console.log('edit-constant suggestPredicates');
                    return RestService.mappings.suggestPredicates(query);
                };

                $scope.suggestClasses = function (query) {
                    //console.log('edit-constant suggestClasses');
                    return RestService.ontology.queryClasses(query)
                        .then(function (response) {
                            return response.data.data;
                        });
                };

                $scope.save = function () {
                    closeDialogPanel('edit-constant-panel', onSave, {model: model, action: 'add'});
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

