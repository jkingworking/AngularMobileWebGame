(function ()
{
    'use strict';

    angular.module('view.game', ['ngAnimate'])
        .config(function ($stateProvider)
        {
            $stateProvider
                .state('app.game', {
                    url     : '/game/:gameId',
                    views   : {
                        mainContent : {
                            templateUrl : 'views/game/template.html',
                            controller  : 'gameController'
                        }
                    },
                    data    : {
                        bodyClass : 'game-state',
                        title     : 'Play'
                    },
                    resolve : {
                        gameData : function ($rootScope, $http, $stateParams, _apiUrlBase)
                        {
                            $rootScope._loading = true;
                            return $http
                                .get(_apiUrlBase + 'v1/game/' + $stateParams.gameId)
                                .then(function (data)
                                {
                                    return data.data;
                                },
                                function (error)
                                {
                                    $rootScope._loading = false;
                                    $rootScope.goBack();
                                    $rootScope._error = error;
                                });
                        }
                    }
                });
        })
        .controller('gameController', function ($http, $scope, $rootScope, $state, gameData, $filter, ModalService)
        {
            $rootScope._loading = false;
            $rootScope._showMenuBtn = false;
            $rootScope._showBackBtn = true;
            $rootScope._stateTitle = gameData.title;
            $scope.gameData = gameData;

            $rootScope.calculateRewards = function (data, activity)
            {
                var reward = 0;
                if (activity.condition_value === null || activity.condition_value === '*' || activity.condition_value === data)
                {
                    if (activity.condition_reward_amount)
                    {
                        var rwdAmt = JSON.parse(activity.condition_reward_amount);
                        reward = rwdAmt[data];
                    }
                    else
                    {
                        reward = activity.reward_amount;
                    }
                }
                return parseFloat(reward);
            };
        });
})();