'use strict';

angular.module('view.login', ['service.auth'])

    .config(function ($stateProvider)
    {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login/template.html',
                controller: 'loginController',
                data: {
                    bodyClass: 'login-state'
                },
                resolve: {
                    userState: function (localStorageService, $rootScope)
                    {
                        $rootScope._loading = true;
                        return localStorageService.get('userInfo');
                    }
                }
            })

            .state('logout', {
                url: '/logout',
                controller: function (authService, $state)
                {
                    authService.logout().then(
                        function ()
                        {
                            $state.go('login');
                        }
                    );
                }
            });
    })

    .controller('loginController', function (authService, $rootScope, $scope, $state, localStorageService, $http, userState)
    {
        $rootScope._loading = false;
        var loginRedirectState = 'app.dashboard';
        if (userState)
        {
            $state.go(loginRedirectState);
        }
        $scope.forgotPassword = false;

        $scope.login = localStorageService.get('login') || {
            username: null,
            password: null,
            remember: true
        };

        $scope.loginUser = function ()
        {
            $rootScope._loginNotification = false;
            if ($scope.forgotPassword && $scope.login.username)
            {
                $scope.loading = true;
                $scope.error = null;

                authService.forgotPassword($scope.login.username)
                    .then(
                    function (data)
                    {
                        $scope.loading = false;
                        $scope.forgotPassword = false;
                        $scope.error = 'An email has been sent to you with password reset instructions.';
                    },
                    function (data)
                    {
                        $scope.loading = false;
                        $scope.error = data.data.error;
                    }
                );

            }
            else if ($scope.login.username && $scope.login.password)
            {
                $scope.loading = true;
                $scope.error = null;

                localStorageService.set('login', $scope.login);

                authService.login($scope.login.username, $scope.login.password)
                    .then(
                    // Successful Login
                    function (data)
                    {
                        $state.go(loginRedirectState);
                        $scope.loading = false;
                    },

                    // Failed Login
                    function (data)
                    {
                        $scope.loading = false;

                        if (data.data)
                        {
                            if (data.data.error === 'user not found')
                            {
                                $scope.error = 'No account exists for this email address. To create your account use the sign up link below.';
                            }
                            else
                            {
                                $scope.error = data.data.error;
                            }
                        }
                        else
                        {
                            $scope.error = "Oops, something went wrong.";
                        }

                        // Clears the stored login since it failed
                        localStorageService.remove('login');

                    }
                );
            }
        };

        $scope.signUp = function ()
        {
            $state.go('signUp');
        };

        //$scope.forgotPassword = function ()
        //{
        //    $scope.forgotPassword = true;
        //};

        //$scope.signUp = function ()
        //{
        //    $state.go('signUp');
        //};

    });