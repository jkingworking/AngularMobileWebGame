(function ()
{
    'use strict';

    angular.module('view.signUp', ['service.auth'])

        .config(function ($stateProvider)
        {
            $stateProvider
                .state('signUp', {
                    url         : '/signup/:invitecode/:email',
                    templateUrl : 'views/signup/template.html',
                    controller  : 'signUpController',
                    data        : {
                        bodyClass : 'login-state'
                    },
                    resolve     : {
                        groupData : function ($http, $rootScope, $stateParams, _apiUrlBase)
                        {
                            $rootScope._loading = true;
                            return $http
                                .get(_apiUrlBase + 'v1/signup/groups')
                                .then(function (data)
                                {
                                    if ($stateParams.invitecode)
                                    {
                                        for (var i in data.data)
                                        {
                                            if (data.data[i].invitation_code === $stateParams.invitecode)
                                            {
                                                return data.data[i];
                                            }
                                        }
                                    }
                                    return data.data;
                                }, function (error)
                                {
                                    $rootScope._error = error;
                                    return error;
                                });

                        }
                    }
                });
        })

        .controller('signUpController', function (authService, $rootScope, $scope, $state, localStorageService, $http, groupData, $stateParams, _apiUrlBase)
        {
            $rootScope._loading = false;
            $scope.groups = [];

            $scope.signup = {
                group_id : '',
                email    : $stateParams.email || ''
            };

            if (angular.isArray(groupData))
            {
                $scope.groups = groupData;
            }
            else
            {
                $scope.group = groupData;
                $scope.signup.group_id = groupData.id;
            }

            $scope.confirmPassword = function ()
            {
                if ($scope.signup.password && $scope.signup.password !== $scope.signup.password_confirm)
                {
                    $scope.passwordMismatch = true;
                }
                else
                {
                    $scope.passwordMismatch = false;
                }
            };

            $scope.signUpUser = function ()
            {
                $rootScope._loading = true;
                $scope.errors = false;
                $http.post(_apiUrlBase + 'v1/signup/user', $scope.signup).then(
                    function (data)
                    {
                        $rootScope._loading = false;
                        $rootScope._loginNotification = 'Your account has been successfully created.';
                        $state.go('login');
                    },
                    function (data)
                    {
                        $rootScope._loading = false;
                        $scope.errors = [];
                        angular.forEach(data.data.errors, function (obj)
                        {
                            $scope.errors.push(obj);
                        });
                    }
                );
            };

        });
})();