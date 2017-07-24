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
                // scope: $scope,
                // preserveScope: true,
                templateUrl: './templates/mappings/template-item.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
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
                    $scope.paging = {
                        pageIndex: response.data.page,
                        current: response.data.page + 1,
                        total: response.data.pageCount,
                        size: response.data.pageSize
                    }
                });
        };

        // $scope.load();

        function DialogController($scope, $mdDialog, item) {
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

            $scope.autoCompleteOptions = {
                minimumChars: 2,
                dropdownHeight: '200',
                data: function (term) {
                    return RestService.mappings.predicatesSearch(term);
                }
            };

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

            $scope.cancel = (row) => {
                row.edit = !row.edit;
            };
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
                    $scope.paging = {
                        pageIndex: response.data.page,
                        current: response.data.page + 1,
                        total: response.data.pageCount,
                        size: response.data.pageSize
                    }
                });
        };

        // $scope.load();


    });
