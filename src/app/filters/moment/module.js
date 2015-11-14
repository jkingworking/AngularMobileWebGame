'use strict';

angular.module('filter.moment', [])
    .filter('moment', function ($rootScope)
    {
        return function (input, param)
        {
            if (param === 'fromNow'){
                return moment.utc(input).tz($rootScope.user.timezone).fromNow();
            }
            else
            if (param === 'calendar')
            {
                return moment.utc(input).tz($rootScope.user.timezone).calendar();
            }
            return moment.utc(input).tz($rootScope.user.timezone).format(param);
        };
    });