(function ()
{
    'use strict';

    angular.module('view.profile', [])
        .config(function ($stateProvider)
        {
            $stateProvider
                .state('app.profile', {
                    url     : '/profile/:profileId',
                    views   : {
                        mainContent : {
                            templateUrl : 'views/profile/template.html',
                            controller  : 'profileController'
                        }
                    },
                    data    : {
                        bodyClass : 'profile-state',
                        title     : 'Profile'
                    },
                    resolve : {
                        profileData : function ($rootScope, $http, $stateParams, _apiUrlBase)
                        {
                            $rootScope._loading = true;
                            return $http
                                .get(_apiUrlBase + 'v1/user/profile/' + $stateParams.profileId)
                                .then(function (data)
                                {
                                    return data.data;
                                }, function (error)
                                {
                                    return error;
                                });
                        }
                    }
                });
        })
        .controller('profileController', function ($scope, $rootScope, profileData, $state)
        {
            $rootScope._loading = false;

            if (profileData.user.id === $rootScope.user.id)
            {
                $rootScope._headerBtn = {
                    title      : 'Dashboard',
                    state      : 'app.settings',
                    icon       : 'fa fa-gear',
                    badgeCount : false
                };
            }
            $scope.profileData = profileData;
        });
})();