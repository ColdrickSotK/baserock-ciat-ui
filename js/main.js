var app = angular.module('ciat', []);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.controller('VisualisationController', ['$scope', '$http',
    function($scope, $http) {
        function formatBuild(response) {
            return {
                success: response.data.text[response.data.text.length - 1] === 'successful',
            };
        }

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
]);
