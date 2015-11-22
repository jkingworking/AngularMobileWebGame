(function ()
{
    'use strict';

    angular.module('view.modal', [])

        .controller('modalGameComplete', function ($rootScope, $scope, close, $state, $timeout)
        {
            $scope.modalClass = {
                entering : true,
                leaving  : false
            };

            $timeout(function ()
            {
                $scope.modalClass.entering = false;
            }, $rootScope._animationTime);

            $scope.buttonAction = function ()
            {
                $timeout(function ()
                {
                    $scope.modalClass.leaving = true;
                    close("Success!", $rootScope._animationTime);
                    angular.element(document.getElementsByTagName('body')).removeClass('modal-open');
                    $state.go('app.' + $rootScope.modalData.button.state);
                }, 0);
            };

            $scope.gameAction = function ()
            {
                if ($rootScope.modalData.action === 'nextQuestion')
                {
                    $rootScope.currentQuestion++;
                }
                else
                    if ($rootScope.modalData.action === 'backToGames')
                    {
                        $state.go('app.games');
                    }
                $scope.modalClass.leaving = true;
                close("Success!", $rootScope._animationTime);
                angular.element(document.getElementsByTagName('body')).removeClass('modal-open');
            };

            $scope.close = function ()
            {
                close("Success!", $rootScope._animationTime);
                angular.element(document.getElementsByTagName('body')).removeClass('modal-open');
            };

        });
})();