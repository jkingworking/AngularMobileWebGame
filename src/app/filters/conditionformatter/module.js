(function ()
{
    'use strict';

    angular.module('filter.conditionFormatter', [])
        .filter('conditionFormatter', function ()
        {
            return function (input, param)
            {
                var string = input.split(/(?=[A-Z])/).join(' ');
                return string.substring(0, 1).toUpperCase() + string.substring(1);
            };
        });
})();