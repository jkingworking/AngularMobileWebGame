(function ()
{
    'use strict';

    angular.module('view.roadToSale', [])
        .config(function ($stateProvider)
        {
            $stateProvider
                .state('app.roadToSale', {
                    url   : '/road_to_sale',
                    views : {
                        mainContent : {
                            templateUrl : 'views/roadtosale/template.html',
                            controller  : 'roadToSaleController'
                        }
                    },
                    data  : {
                        bodyClass : 'road-to-sale-state',
                        title     : 'Road to Sale'
                    }
                });
        })
        .controller('roadToSaleController', function ($scope, $rootScope, $state, ModalService, localStorageService, $http, _apiUrlBase)
        {
            $scope.games = [];
            $scope.playGame = function (game)
            {
                if (!game.availableAt)
                {
                    $rootScope._soundEffects.gameOpen.play();
                    $state.go('app.game', {gameId : game.id});
                }
                else
                {

                    $rootScope._soundEffects.error.play();
                    $rootScope.modalData = {
                        title       : 'Hang on there',
                        message     : 'You\'ve play all you can for now. You can play again ',
                        availableAt : game.availableAt
                    };
                    ModalService.showModal({
                        templateUrl : "views/modals/cant_play_yet.html",
                        controller  : "modalGameComplete"
                    }).then(function (modal)
                    {
                        modal.element.modal({
                            backdrop : 'static',
                            keyboard : false
                        });
                    });
                }
            };

            function setData(data)
            {
                if (!angular.equals($scope.games, data))
                {
                    $scope.games = data;
                }
            }

            function loadData()
            {
                $http.get(_apiUrlBase + 'v2/games/road_to_sale').then(
                    function (data)
                    {
                        localStorageService.set('roadToSaleData', data.data);
                        setData(data.data);
                    },
                    function (error)
                    {
                        return error;
                    }
                );
            }

            function init()
            {
                var roadToSaleData = localStorageService.get('roadToSaleData');
                if (roadToSaleData)
                {
                    setData(roadToSaleData);
                }
                loadData();
            }

            init();

        });
})();