(function ()
{
    'use strict';

    angular.module('directive.weekDayPicker', [])
        .directive('weekDayPicker', function ()
        {
            return {
                restrict    : 'EA',
                replace     : true,
                templateUrl : 'directives/weekdaypicker/template.html',
                controller  : 'weekDayPickerController',
                scope       : {
                    onSetTime : '=',
                    config    : '=',
                    ngModel   : '='
                }
            };
        })
        .controller('weekDayPickerController', function ($scope, $rootScope, $http, ModalService)
        {
            function getFirstDay(d)
            {
                d = new Date(d);
                var day = d.getDay(),
                    diff = d.getDate() - day;
                return new Date(d.setDate(diff));
            }

            function getLastDay(d)
            {
                d = new Date(d);
                var diff = d.getDate() + 13;
                return new Date(d.setDate(diff));
            }

            $scope.dateRange = [];
            $scope.today = new Date();
            $scope.ngModel = $scope.selected;
            console.log('$scope.ngModel', $scope.ngModel);
            var firstDay = getFirstDay($scope.today);
            var lastDay = getLastDay(firstDay);

            for (var i = new Date(firstDay); i <= lastDay; i.setDate(i.getDate() + 1))
            {
                $scope.dateRange.push(new Date(i.setDate(i.getDate())));
            }

            $scope.selectDate = function (day)
            {
                $scope.ngModel = $scope.selected = day;
            };
        });
})();