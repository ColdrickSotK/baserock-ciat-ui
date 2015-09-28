var apiBase = 'http://ciat.baserock.org:8010/json';
var app = angular.module('ciat', ['ngRoute']);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        controller: 'VisualisationController',
        templateUrl: 'partials/visualisation.html'
    })
    .when('/builders/:name', {
        controller: 'BuilderDetailController',
        templateUrl: 'partials/builder_detail.html'
    })
    .when('/builders/:name/build/:number', {
        controller: 'BuildDetailController',
        templateUrl: 'partials/build_detail.html'
    })
    .otherwise({redirectTo: '/'});
}]);

app.controller('VisualisationController', function($scope, $http, $q, $interval) {
        function checkInArray(array, key) {
            if (array) {
                if (array.indexOf(key) > -1) {
                    return true;
                }
            }
            return false;
        }

        function load() {
            $scope.steps = [];
            $http.get(apiBase + '/builders')
                .then(function(builders) {
                    angular.forEach(builders.data, function(value, key) {
                        var lastBuildID;
                        if (value.state === 'building') {
                            lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 2];
                        } else {
                            lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 1];
                        }

                        var buildsPath = apiBase + '/builders/' + key +
                                         '/builds/' + lastBuildID;
                        $http.get(buildsPath).then(function(response) {
                            var details = {
                                success: checkInArray(response.data.text, 'successful'),
                                failed: checkInArray(response.data.text, 'failed'),
                                steps: response.data.steps,
                                sourceStamps: response.data.sourceStamps,
                                number: response.data.number
                            };
                            $scope.steps.push({
                                name: key,
                                lastBuild: details,
                                data: value
                            });
                            $scope.steps.sort(function(a, b) {
                                var left = parseInt(a.name.split('.', 1));
                                var right = parseInt(b.name.split('.', 1));
                                return left - right;
                            });
                        });
                    });
                });
        }

        $scope.selected = null;
        $scope.select = function(step, e) {
            if (e) {
                e.stopPropagation();
            }
            if ($scope.selected === step) {
                $scope.selected = null;
            } else {
                $scope.selected = step;
            }
        };

        function cancelRefresh() {
            if (angular.isDefined(autorefresh)) {
                $interval.cancel(autorefresh);
                autorefresh = undefined;
            }
        }

        load();
        var autorefresh = $interval(load, 60000);

        $scope.$on('$destroy', function() {
          cancelRefresh();
        });
    }
);


app.controller('BuilderDetailController',
    function($scope, $http, $routeParams) {
        $http.get(apiBase + '/builders/' + $routeParams.name).then(function(builder) {
            $scope.builder = {
                name: $routeParams.name,
                data: builder.data
            };
        });
    }
);
