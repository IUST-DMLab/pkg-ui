app
    .controller('ReportController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {
        $scope.getSelectedTabIndex = () => {
            return $state.current.data.index;
        };
    })

    .controller('ReportSubjectsController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {
        $scope.query = {
            username: undefined,
            hasVote: undefined,
            vote: undefined,
            pageIndex: 0,
            pageSize: 20
        };

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if (!$scope.paging) return;
            let pageIndex = $scope.paging.current - 1;
            $scope.load(pageIndex);
        };

        $scope.load = function (pageIndex) {
            let authToken = $cookieStore.get('authToken');
            $scope.query.pageIndex = pageIndex || 0;

            RestService.reports.bySubject(authToken, $scope.query)
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
    })

    .controller('ReportSummariesController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {
        $scope.query = {
            username: undefined,
            hasVote: undefined,
            vote: undefined,
            pageIndex: 0,
            pageSize: 20
        };

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if (!$scope.paging) return;
            let pageIndex = $scope.paging.current - 1;
            $scope.load(pageIndex);
        };

        $scope.load = function (pageIndex) {
            let authToken = $cookieStore.get('authToken');
            $scope.query.pageIndex = pageIndex || 0;

            RestService.reports.byUser(authToken, $scope.query)
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
    })

    .controller('ReportVotesController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {
        $scope.query = {
            username: undefined,
            hasVote: undefined,
            vote: undefined,
            pageIndex: 0,
            pageSize: 20
        };

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if (!$scope.paging) return;
            let pageIndex = $scope.paging.current - 1;
            $scope.load(pageIndex);
        };

        $scope.load = function (pageIndex) {
            let authToken = $cookieStore.get('authToken');
            $scope.query.pageIndex = pageIndex || 0;

            RestService.reports.byUserVotes(authToken, $scope.query)
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
    })

    .controller('ReportTriplesController', function ($scope, RestService, $state, $cookieStore, $mdDialog, $location) {
        $scope.query = {
            username: undefined,
            hasVote: undefined,
            vote: undefined,
            pageIndex: 0,
            pageSize: 20
        };

        $scope.paging = {
            pageIndex: 0,
            current: 1
        };

        $scope.onPageChanged = function () {
            if (!$scope.paging) return;
            let pageIndex = $scope.paging.current - 1;
            $scope.load(pageIndex);
        };

        $scope.load = function (pageIndex) {
            let authToken = $cookieStore.get('authToken');
            $scope.query.pageIndex = pageIndex || 0;

            RestService.reports.byTriples(authToken, $scope.query)
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
    });
