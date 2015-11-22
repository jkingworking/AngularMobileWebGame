(function ()
{
    'use strict';

    angular.module('directive.avatar', [])
        .directive('avatar', function ()
        {
            return {
                restrict    : 'E',
                replace     : true,
                templateUrl : 'directives/avatar/template.html',
                controller  : function ($scope, $rootScope)
                {
                    $scope.avatarBackground = {
                        'background-image' : 'url(' + $scope.avatarUrl + ')'
                    };
                },
                scope       : {
                    avatarUrl : '=src'
                }
            };
        });
})();