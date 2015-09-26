var app = angular.module('ciat', []);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.controller('VisualisationController', function($scope, $http, $q) {
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
                       var lastBuildID = -1;
                       if (value.state === 'building') {
                           lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 2];
                       } else {
                           lastBuildID = value.cachedBuilds[value.cachedBuilds.length - 1];
                       }

                       var previous = null;
                       if (lastBuildID != -1) {
                           var buildsPath = 'http://ciat.baserock.org:8010/json/builders/' +
                                            key + '/builds/' + lastBuildID;
                           previous = $http.get(buildsPath).then(formatBuild);
                       }

                       var step = {
                           name: key,
                           lastBuild: previous,
                           data: value
                       }
                       $scope.steps.push(step);
                   });
               });
        }

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
