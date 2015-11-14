'use strict';

angular.module('directive.carRace', [])
    .directive('carRace', function ()
    {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'directives/carrace/template.html',
            controller: 'carRaceController',
            scope: {
                racers: '=',
                place: '='
            }
        };
    })
    .controller('carRaceController', function ($scope, $rootScope)
    {
        function getRandomArbitrary(min, max) {
            return Math.round(Math.random() * (max - min) + min);
        }

        $scope.user = $rootScope.user;
        var raceLocations = [
            'city',
            'country',
            'ocean'
        ];
        var locId = getRandomArbitrary(0,2);
        console.log('locId', locId);
        $scope.raceLocation = raceLocations[locId];

    });