(function ()
{
    'use strict';

    angular.module('directive.games.testDrive', [])
        .directive('gameTestDrive', function ()
        {
            return {
                restrict    : 'EA',
                replace     : true,
                templateUrl : 'directives/games/testdrive/template.html',
                controller  : 'gameTestDriveController',
                scope       : {
                    gameData : '='
                }
            };
        })
        .controller('gameTestDriveController', function ($scope, $rootScope, $http, ModalService, $timeout, _apiUrlBase)
        {
            var postData = {activities : [], gameId : $scope.gameData.id};
            $rootScope._bodyClass += ' test-drive-game';
            $scope.formData = {};
            $scope.totalRewards = {};
            $scope.clearFocus = false;
            $scope.currentActivity = 0;

            function init()
            {
                $scope.stateClass = 'animate-in';
                $scope.activity = $scope.gameData.activities[$scope.currentActivity];
                var customers = ($scope.activity.condition_param) ? $scope.activity.condition_param.split(',').Unique() : null;
                $scope.customers = customers;
            }

            function transitionToActivity(nextActivity)
            {
                $scope.currentActivity = $rootScope.currentActivity = nextActivity;
                init();
            }

            $scope.chooseCustomer = function (customer)
            {
                $scope.formData[$scope.currentActivity] = customer;
            };

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

            $scope.showReward = function ($index)
            {
                if ($scope.gameData.activities[$index].activity_type === 'radio')
                {
                    if ($scope.formData[$index] === $scope.gameData.activities[$index].condition_value)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                    if ($scope.gameData.activities[$index].activity_type === 'select')
                    {
                        if ($scope.formData[$index])
                        {
                            if (
                                $scope.gameData.activities[$index].condition_value === '*' ||
                                $scope.formData[$index] === $scope.gameData.activities[$index].condition_value)
                            {
                                return true;
                            }
                        }

                        return false;
                    }
                    else
                        if ($scope.formData[$index])
                        {
                            return true;
                        }
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

            $scope.$watch('formData', function (newFormData)
            {
                var totalRewards = {};
                var showButton = false; // $scope.showButton;
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
            }, true);

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

            init();

        });
})();