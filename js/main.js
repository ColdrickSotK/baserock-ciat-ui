var app = angular.module('ciat', []);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.controller('VisualisationController', function($scope, $http, $q, $interval) {
        function checkInArray(array, key) {
            if (array) {
                if (array.indexOf(key) > -1) {
                    return true;
                }
            }
            return False;
        }

        function load() {
            $scope.steps = [];
            $http.get('http://ciat.baserock.org:8010/json/builders')
                .then(function(builders) {
                    angular.forEach(builders.data, function(value, key) {
                        var lastBuildID;
                        if (value.state === 'building') {
                            lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 2];
                        } else {
                            lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 1];
                        }

                        var buildsPath = 'http://ciat.baserock.org:8010/json/builders/' +
                                          key + '/builds/' + lastBuildID;
                        $http.get(buildsPath).then(function(response) {
                            var details = {
                                success: checkInArray(response.data.text, 'successful'),
                                failed: checkInArray(response.data.text, 'failed'),
                                steps: response.data.steps
                            };
                            $scope.steps.push({
                                name: key,
                                lastBuild: details,
                                data: value
                            });
                            $scope.steps.sort(function(a, b) {
                                return a.name.charAt(0) > b.name.charAt(0);
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
            $scope.selected = step;
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
]);
