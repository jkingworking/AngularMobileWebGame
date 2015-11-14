'use strict';

angular.module('view.games', [])
    .config(function ($stateProvider)
    {
        $stateProvider
            .state('app.games', {
                url: '/games',
                views: {
                    mainContent: {
                        templateUrl: 'views/games/template.html',
                        controller: 'gamesController'
                    }
                },
                data: {
                    bodyClass: 'games-state',
                    title: 'Games'
                }
            });
    })
    .controller('gamesController', function ($scope, $rootScope, $state, ModalService, localStorageService, $http)
    {
        $scope.playGame = function(game)
        {
            if (!game.availableAt)
            {
                $rootScope._soundEffects.gameOpen.play();
                $state.go('app.game', {gameId: game.id});
            }
            else
            {

                $rootScope._soundEffects.error.play();
                $rootScope.modalData = {
                    title: 'Hang on there',
                    message: 'You\'ve play all you can for now. You can play again ',
                    availableAt: game.availableAt
                };
                ModalService.showModal({
                    templateUrl: "views/modals/cant_play_yet.html",
                    controller: "modalGameComplete"
                }).then(function (modal)
                {
                    modal.element.modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                });
            }
        };

        function loadData(){
            return $http.get($rootScope._apiUrlBase + 'v2/games/available').then(
                function (data)
                {
                    localStorageService.set('gamesData', data.data);
                    setData(data.data);
                },
                function (error)
                {
                    return error;
                });
        }

        function setData(data)
        {
            if(!angular.equals($scope.games, data))
            {
                $scope.games = data;
            }
        }

        function init()
        {
            var gamesData = localStorageService.get('gamesData');
            if (gamesData)
            {
                $scope.games = gamesData;
            }
            loadData();
        }

        init();
    });