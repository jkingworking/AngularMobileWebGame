(function() {
    'use strict';

    angular.module('view.dashboard', ['view.app'])
        .config(function ($stateProvider)
        {
            $stateProvider
                .state('app.dashboard', {
                    url   : '/dashboard',
                    views : {
                        'mainContent' : {
                            templateUrl : 'views/dashboard/template.html',
                            controller  : 'dashboardController'
                        }
                    },
                    data  : {
                        bodyClass : 'dashboard-state'
                    }
                }
            );
        })
        .controller('dashboardController', function ($scope, $state, $http, $timeout, $rootScope, $filter, localStorageService, _apiUrlBase)
        {
            $scope.racers = [];
            $scope.slides = [];
            $scope.newsFeed = [];

            $scope.earnPoints = function ()
            {
                $rootScope._soundEffects.click.play();
                $state.go('app.games');
            };

            $scope.setSlide = function ($index)
            {
                $rootScope._soundEffects.click.play();
                $scope.slideIndex = $index;
            };

            function setDashboardData(data)
            {
                var dashboardData = data;
                console.log('dashboardData', dashboardData);
                $scope.place = dashboardData.rank.group;
                $scope.racers = dashboardData.leaderboardRacers;
                $scope.slides = [
                    $filter('number')(dashboardData.points.monthlyPoints) + ' pts',
                    $filter('ordinal')(dashboardData.rank.group),
                    $filter('number')(dashboardData.gamesSummary.percentCorrect * 100, 0) + '% correct'
                ];
                if (!angular.equals($scope.newsFeed, dashboardData.newsItems))
                {
                    $scope.newsFeed = dashboardData.newsItems;
                }
                // refreshData();
            }

            function fetchData()
            {
                return $http
                    .get(_apiUrlBase + 'v1/user/dashboard')
                    .then(
                    function (data)
                    {
                        localStorageService.set('dashboardData', data.data);
                        setDashboardData(data.data);
                    });
            }

            function refreshData()
            {
                $timeout(function ()
                {
                    fetchData();
                    if ($state.is('app.dashboard'))
                    {
                        refreshData();
                    }
                }, 2000);
            }

            function init()
            {
                var data = localStorageService.get('dashboardData');
                if (data)
                {
                    setDashboardData(data);
                }
                fetchData();
            }

            init();
        });
})();