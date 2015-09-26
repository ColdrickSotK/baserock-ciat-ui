var app = angular.module('ciat', []);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.controller('VisualisationController', ['$scope', '$http',
    function($scope, $http) {
        $scope.steps = [];
        $http.get('http://ciat.baserock.org:8010/json/builders')
            .then(function(builders) {
                angular.forEach(builders.data, function(value, key) {
                    var step = {
                        name: key,
                        last_build: value.cachedBuilds[value.cachedBuilds.length - 1],
                        data: value
                    }
                    $scope.steps.push(step);
                });
            });
    }
]);
