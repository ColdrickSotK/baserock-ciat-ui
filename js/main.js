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
            $scope.integrations = [];
            $scope.builds = [];
            $scope.deploys = [];
            $scope.tests = [];
            $scope.publishings = [];
            $http.get(apiBase + '/builders')
                .then(function(builders) {
                    angular.forEach(builders.data, function(value, key) {
                        var lastBuildID;
                        var currentBuildStarted;
                        var state = value.state;

                        var latestBuildNumber = value.cachedBuilds.length - 1;
                        var latestBuildsPath = apiBase + '/builders/' + key +
                                         '/builds/' + latestBuildNumber;
                        $http.get(latestBuildsPath).then(function(estimationResponse) {

                        var currentTime = Math.floor((new Date()).getTime() / 1000)
                        var timeRunning = 0;
                        if (state === 'building') {
                            lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 2];
                             timeRunning = currentTime - estimationResponse.data.times[0];
                        } else {
                            lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 1];
                        }

                        var buildsPath = apiBase + '/builders/' + key +
                                         '/builds/' + lastBuildID;


                        $http.get(buildsPath).then(function(response) {
                            var progress = 100;
                            var previousTime = response.data.times[1] - response.data.times[0];
                            var success = checkInArray(response.data.text, 'successful');
                            var failed = ! success;
                            var details = {
                                success: success,
                                failed: failed,
                                steps: response.data.steps,
                                sourceStamps: response.data.sourceStamps,
                                number: response.data.number
                            };

                            if (key.indexOf("Integration") > -1) {
                                $scope.integrations.push({
                                    name: key,
                                    lastBuild: details,
                                    data: value
                                });
                            }
                            else if (key.indexOf("Build") > -1) {
                                var progressStyle = "progress-bar-success progress-bar-striped"
                                if (state === "building" ) {
                                    progressStyle = "progress-bar-warning progress-bar-striped active"
                                    progress = (timeRunning * 100) / previousTime;
                                    //alert (currentTime)
                                    //alert (estimationResponse.data.times[0])
                                    //alert (timeRunning)
                                    //alert (previousTime)
                                    if (progress > 100 ) {
                                        progress = 90;
                                    }
                                }
                                $scope.builds.push({
                                    name: key,
                                    lastBuild: details,
                                    data: value,
                                    progress: progress,
                                    style: progressStyle

                                });
                            }
                            else if(key.indexOf("Deploy") > -1) {
                                $scope.deploys.push({
                                    name: key,
                                    lastBuild: details,
                                    data: value
                                });
                            }
                            else if(key.indexOf("Test") > -1) {
                                $scope.tests.push({
                                    name: key,
                                    lastBuild: details,
                                    data: value
                                });
                            }
                            else if(key.indexOf("Publish") > -1) {
                                $scope.publishings.push({
                                    name: key,
                                    lastBuild: details,
                                    data: value
                                });
                            }



                            $scope.builds.sort(function(a, b) {
                                if(a.name < b.name) return -1;
                                if(a.name > b.name) return 1;
                                return 0;
                            });
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
            if ($scope.selected.data.state === "building") {
                $scope.selected.state = "In progress";
            }
            else {
                $scope.selected.state = "Idle";
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
