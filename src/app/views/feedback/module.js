'use strict';

angular.module('view.feedback', ['view.app'])
    .config(function ($stateProvider)
    {
        $stateProvider
            .state('app.feedback', {
                url: '/feedback',
                views: {
                    mainContent: {
                        templateUrl: 'views/feedback/template.html',
                        controller: 'feedbackController'
                    }
                },
                data: {
                    bodyClass: 'feedback-state',
                    title: 'Feedback'
                }
            });
    })
    .controller('feedbackController', function ($scope, $rootScope, $timeout, $http)
    {
        var timeout = 5000;
        $rootScope._loading = false;
        $scope.complete = false;
        $scope.feedback= {};

        $scope.sendFeedback = function ()
        {
            $scope.complete = true;
            $http
                .post($rootScope._apiUrlBase + 'v1/contact/feedback', {version:$rootScope._version, feedback:$scope.feedback.comment})
                .then(function (data)
                {
                    $scope.feedback.comment = '';
                    // Show the form again after a few seconds
                    $timeout(function ()
                    {
                        $scope.complete = false;
                    }, timeout);
                }, function (error)
                {
                    $scope.complete = false;
                });
        };
    });