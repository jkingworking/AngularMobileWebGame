(function ()
{
    'use strict';

    angular.module('directive.games.soldVehicle', [])
        .directive('gameSoldVehicle', function ()
        {
            return {
                restrict    : 'EA',
                replace     : true,
                templateUrl : 'directives/games/soldvehicle/template.html',
                controller  : 'gameSoldVehicleController',
                scope       : {
                    gameData : '='
                }
            };
        })
        .controller('gameSoldVehicleController', function ($scope, $rootScope, $http, ModalService, $timeout, $state, _apiUrlBase)
        {
            var postData = {activities : [], gameId : $scope.gameData.id};
            $rootScope._bodyClass += ' vehicle-sold-game';
            $scope.formData = {};
            $scope.totalRewards = {};
            $scope.clearFocus = false;
            $scope.currentActivity = 0;

            function goBack()
            {
                var prevActivity = $scope.currentActivity - 1;
                if (prevActivity >= 0)
                {
                    $scope.stateClass = 'animate-back';
                    $timeout(function ()
                    {
                        $scope.currentActivity = $rootScope.currentActivity = $scope.currentActivity - 1;
                        init('animate-back-in');
                    }, $rootScope._animationTime);
                }
                else
                {
                    $state.go('app.roadToSale');
                }
            }

            $rootScope._backFunct = goBack;

            function init(animateClass)
            {
                $scope.stateClass = (animateClass) ? animateClass : 'animate-in';
                $scope.activity = $scope.gameData.activities[$scope.currentActivity];
                $scope.customers = $scope.activity.condition_param.split(',');
            }

            function transitionToActivity(nextActivity)
            {
                $scope.currentActivity = $rootScope.currentActivity = nextActivity;
                init();
            }

            $scope.submitInfo = function ()
            {
                if ($scope.formData)
                {
                    $rootScope._loading = true;
                    //Format Data to send back to server
                    var postData = {
                        gameId     : $scope.gameData.id,
                        activities : []
                    };
                    angular.forEach($scope.formData, function (data, key)
                    {
                        if (data)
                        {
                            postData.activities.push({
                                id    : $scope.gameData.activities[key].id,
                                value : data
                            });
                        }
                    });
                    $http
                        .post(_apiUrlBase + 'v1/game/play/' + $scope.gameData.id, postData)
                        .then(
                        function (data)
                        {
                            $rootScope._loading = false;

                            if (data.data.action === 'showModal')
                            {
                                $rootScope.modalData = data.data.response;
                                $rootScope.modalData.button.state = 'roadToSale';

                                $rootScope._soundEffects.earnPoints.play();
                                ModalService.showModal({
                                    templateUrl : "views/modals/game_complete.html",
                                    controller  : "modalGameComplete"
                                }).then(function (modal)
                                {
                                    modal.element.modal({
                                        backdrop : 'static',
                                        keyboard : false
                                    });
                                });
                            }
                        },
                        function (error)
                        {
                            $rootScope._loading = false;
                        }
                    );
                }
            };

            $scope.setRadioValue = function (index, value)
            {
                $rootScope._soundEffects.click.play();
                $scope.formData[index] = value;
            };

            $scope.rewardAmount = function ($index)
            {
                var activity = $scope.gameData.activities[$index];
                if (activity.condition_reward_amount)
                {
                    var conditionRewardAmount = angular.fromJson(activity.condition_reward_amount);
                    if (conditionRewardAmount[$scope.formData[$index]])
                    {
                        return conditionRewardAmount[$scope.formData[$index]];
                    }
                }
                return activity.reward_amount;
            };

            $scope.$watch('formData', function (newFormData, oldFormData)
            {
                var totalRewards = {};
                var showButton = $scope.showButton;
                angular.forEach(newFormData, function (data, key)
                {
                    if (data)
                    {
                        totalRewards[$scope.gameData.activities[key].reward_type] = parseFloat(totalRewards[$scope.gameData.activities[key].reward_type] || 0) + $rootScope.calculateRewards(data, $scope.gameData.activities[key]);
                        showButton = true;
                    }
                });
                $scope.totalRewards = totalRewards;
                $scope.showButton = showButton;

                if (!angular.equals(newFormData, oldFormData))
                {
                    $scope.nextActivity();
                }

            }, true);

            $scope.onDateSet = function (newDate, oldDate)
            {
                $rootScope._soundEffects.click.play();
            };

            $scope.optionChanged = function ()
            {
                $rootScope._soundEffects.click.play();
            };

            $scope.nextActivity = function ()
            {
                $scope.clearFocus = !$scope.clearFocus;
                var curActivity = $scope.currentActivity;
                var nextActivity = (curActivity + 1 < $scope.gameData.activities.length) ? curActivity + 1 : curActivity;
                if (curActivity === nextActivity)
                {
                    $scope.submitInfo();
                }
                else
                {
                    $scope.stateClass = 'animate-out';
                    $timeout(function ()
                    {
                        transitionToActivity(nextActivity);
                    }, $rootScope._animationTime);
                }
            };

            $scope.$on('destroy', function ()
            {
                $rootScope._backFunct = undefined;
            });

            init();

        });
})();