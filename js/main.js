var app = angular.module('ciat', []);

app.controller('VisualisationController', ['$scope',
    function($scope) {
        $scope.builders = $http.get('http://ciat.baserock.org:8010/json/builders');
    }]);
