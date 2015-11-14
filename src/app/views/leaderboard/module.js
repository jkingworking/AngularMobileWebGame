'use strict';

angular.module('view.leaderBoard', [])
    .config(function ($stateProvider)
    {
        $stateProvider
            .state('app.leaderBoard', {
                url: '/leader_board',
                views: {
                    mainContent: {
                        templateUrl: 'views/leaderboard/template.html',
                        controller: 'leaderBoardController'
                    }
                },
                data: {
                    bodyClass: 'leaderboard-state',
                    title: 'Leader Board'
                }
            });
    })
    .controller('leaderBoardController', function ($scope, $rootScope, $http, localStorageService)
    {
        $scope.boards = [
            {
                name: 'Dealership',
                endpoint: 'v1/leaderboard/group'
            },
            {
                name: 'Region',
                endpoint: 'v1/leaderboard/region'
            },
            {
                name: 'National',
                endpoint: 'v1/leaderboard/national'
            }
        ];
        $scope.activeBoard = 0;

        $scope.selectBoard = function(index)
        {
            $rootScope._soundEffects.click.play();
            $scope.activeBoard = index;
        };

        $scope.$watch('activeBoard', function (nv, ov)
        {
            if(!angular.equals(nv, ov)){
                loadLeaders();
            }
        });

        function loadLeaders()
        {
            $scope.loading = true;
            $http
                .get($rootScope._apiUrlBase + $scope.boards[$scope.activeBoard].endpoint)
                .then(function (data)
                {
                    $scope.loading = false;
                    localStorageService.set('leaderBoardData', data.data);
                    setData(data.data);
                }, function (error)
                {
                    $scope.loading = false;
                    $rootScope._error = error;
                }
            );
        }

        function setData(data)
        {
            $scope.myRank = data.myRank;
            if(!angular.equals($scope.leaders, data.leaders)){
                $scope.leaders = data.leaders;
            }
            $scope.group = data.group;
        }

        function init()
        {
            var data = localStorageService.get('leaderBoardData');
            if (data)
            {
                setData(data);
            }
            loadLeaders();
        }

        init();
    });