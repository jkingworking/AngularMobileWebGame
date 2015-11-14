'use strict';

angular.module('service.user', [])
    .service('userService', function ($q, $rootScope, $http, localStorageService)
    {
        return {
            getUserInfo: function ()
            {
                console.log('fetching User Info');
                return $http
                    .get($rootScope._apiUrlBase + 'v1/user/whoami')
                    .then(function (data)
                    {
                        console.log('broadcasting userUpdated');
                        $rootScope.$broadcast('userUpdated');
                        if(!data.data.avatar)
                        {
                            data.data.avatar = {
                                'file_location': $rootScope._defaultAvatar.file_location
                            };
                        }
                        return data;
                    },
                    function (data)
                    {
                        return data;
                    }
                );
            },
            userInfo: function (force)
            {
                var userService = this;
                var storedUserInfo = localStorageService.get('userInfo');
                if(storedUserInfo && !force)
                {
                    console.log('Returning stored user info');
                    return $q(function (resolve)
                    {
                        return resolve(storedUserInfo);
                    });
                }
                else
                {
                    console.log('Returning fresh user info');
                    return userService.getUserInfo().then(function (data)
                    {
                        localStorageService.set('userInfo', data.data.user);
                        return $q(function (resolve)
                        {
                            return resolve(data.data.user);
                        });
                    });
                }
            },
            save: function ()
            {
                return $http
                    .put($rootScope._apiUrlBase + 'v1/user', $rootScope.user)
                    .then(function (data)
                        {
                            localStorageService.set('userInfo', data.data.user);
                            return data.data.user;
                        },
                        function (data)
                        {
                            return data.data;
                        }
                    );
            },
            clear: function ()
            {
                console.log('clearing UserData');
                localStorageService.remove('userInfo');
            }
        };
    });