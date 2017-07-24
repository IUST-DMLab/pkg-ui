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
            approved: undefined
        };

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if(!$scope.paging) return;
            $scope.query.page = $scope.paging.current - 1;
            $scope.load();
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

    })

    .controller('MappingsPropertyController', function ($scope, RestService, $state, $stateParams, $mdDialog, $location) {

        $scope.paging = {
            total: 100,
            current: 2
        };

        $scope.onPageChanged = function () {
        };

    });
