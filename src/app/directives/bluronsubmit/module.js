'use strict';

angular.module('directive.blurOnSubmit', [])
    .directive('blurOnSubmit', function ()
    {
        return function (scope, element, attr) {
            var textFields = $(element).children('input');
            $(element).submit(function() {
                textFields.blur();
            });
        };
    })
    .directive('clearFocus', function() {
        return {
            restrict: 'A',
            scope:{
                clearFocus: '='
            },
            link: function($scope, $element) {
                $scope.$watch("clearFocus", function(currentValue) {
                    if(currentValue)
                    {
                        $element[0].blur();
                    }
                });
            }
        };
    });