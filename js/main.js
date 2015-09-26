var app = angular.module('ciat', []);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.controller('VisualisationController', ['$scope', '$http',
    function($scope, $http) {
        $scope.builders = $http.get('http://ciat.baserock.org:8010/json/builders');
    }
]);
