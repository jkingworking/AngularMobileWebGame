(function ()
{
    'use strict';

    angular.module('service.auth', [])
        .config([
            '$httpProvider', function ($httpProvider)
            {
                $httpProvider.interceptors.push(function ($q, $rootScope, $location, localStorageService)
                {
                    return {
                        request       : function (request)
                        {
                            var token = localStorageService.get('token');
                            if (token && request.url.substr(0, 4) === 'http')
                            {
                                request.headers['x-auth-key'] = token;
                            }
                            return request;
                        },
                        response      : function (resp)
                        {
                            return resp;
                        },
                        responseError : function (resp, status, headers, config)
                        {
                            if (resp.status === 401)
                            {
                                if ($location.path() !== '/login')
                                {
                                    $location.path('/login');
                                }
                            }
                            return $q.reject(resp);
                        }
                    };
                });
            }
        ])

        .service('authService', function ($q, $rootScope, $http, localStorageService, userService, _apiUrlBase)
        {
            return {
                login          : function (username, password)
                {
                    var authService = this;
                    return $http.post(_apiUrlBase + 'v1/login', {
                        username : username,
                        password : password
                    }).then(function (data)
                    {
                        localStorageService.set('token', data.data.token);
                        $rootScope._loginAttempts = 0;
                        userService.userInfo().then(function (data)
                        {
                            console.log('new user data received', data);
                            $rootScope.user = data;
                        });
                    });
                },
                logout         : function ()
                {
                    return $q(function (resolve)
                    {
                        localStorageService.remove('token');
                        localStorageService.remove('login');
                        userService.clear();
                        return resolve();
                    });
                },
                forgotPassword : function (username)
                {
                    var authService = this;
                    return $http.post(_apiUrlBase + 'v1/forgot_password', {
                        username : username
                    }).then(function ()
                    {
                        $rootScope._loginAttempts = 0;
                    });
                }
            };
        });
})();