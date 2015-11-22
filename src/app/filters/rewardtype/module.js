(function ()
{
    'use strict';

    angular.module('filter.rewardtype', [])
        .filter('rewardType', function ()
        {
            return function (input, param)
            {
                var rewards = {
                    'points'     : {
                        name  : 'Points',
                        short : 'pts'
                    },
                    'experience' : {
                        name  : 'Experience',
                        short : 'exp'
                    },
                    'badge'      : {
                        name  : 'Badge',
                        short : 'bdg'
                    }
                };

                if (rewards[input][param])
                {
                    return rewards[input][param];
                }
                else
                    if (rewards[input])
                    {
                        return rewards[input].name;
                    }
                return input;
            };
        });
})();