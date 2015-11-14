'use strict';

angular.module('view.settings', ['view.app', 'ngFileUpload'])
    .config(function ($stateProvider)
    {
        $stateProvider
            .state('app.settings', {
                url: '/settings',
                views: {
                    mainContent: {
                        templateUrl: 'views/settings/template.html',
                        controller: 'settingsController'
                    }
                },
                data: {
                    bodyClass: 'settings-state',
                    title: 'Settings'
                }
            });
    })
    .controller('settingsController', function ($scope, $rootScope, Upload, userService, localStorageService, $timeout)
    {
        $scope.avatar = $rootScope.user.avatar.file_location || '/assets/icons/Icon-60@3x.png';

        $scope.timeZones = [
            "US/Alaska",
            "US/Aleutian",
            "US/Arizona",
            "US/Central",
            "US/East-Indiana",
            "US/Eastern",
            "US/Hawaii",
            "US/Indiana-Starke",
            "US/Michigan",
            "US/Mountain",
            "US/Pacific",
            "US/Samoa"
        ];

        $scope.updateProfile = function ()
        {
            document.getElementById('name').focus();
            $scope.loading = true;
            userService
                .save()
                .then(function ()
                {
                    $scope.loading = false;
                }, function ()
                {
                    $scope.loading = false;
                });
        };

        $scope.$watch('avatar', function (nv, ov)
        {
            console.log('Avatar Changed', nv);
            if(nv && !angular.equals(nv,ov))
            {
                uploadAvatar();
            }
        });

        function reloadAvatar()
        {
            $rootScope.avatarBackground = {};
            userService
                .userInfo(true)
                .then(function (data)
                {
                    $rootScope.user = data;
                    $rootScope.avatarBackground = {
                        'background-image': 'url(' + data.avatar.file_location + ')'
                    };
                });
        }

        function uploadAvatar()
        {
            $scope.progressIndicator = {height: '100%'};
            $scope.progressComplete = false;
            var token = localStorageService.get('token');
            var upload = Upload
                .upload({
                    url: $rootScope._apiUrlBase + 'v1/user/avatar',
                    file: $scope.avatar,
                    method: 'POST',
                    headers: {'x-auth-key': token}
                })
                .progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    $scope.progressIndicator.height = (100 - parseFloat(progressPercentage))+'%';
                })
                .success(function (data, status, headers, config)
                {
                    // file is uploaded successfully
                    $rootScope._soundEffects.success.play();
                    $scope.progressComplete = true;
                    console.log('file ' + config.file.name + ' was uploaded successfully.');
                    reloadAvatar();
                    $timeout(function ()
                    {
                        $scope.progressComplete = false;
                    }, 3000);
                })
                .error(function (data, status, headers, config)
                {
                    // handle error
                    console.log('avatar Upload error');
                });
        }

        /* Set the default values for ngf-select and ngf-drop directives
         */
        Upload.setDefaults({
            ngfMinSize: 2000,
            ngfMaxSize: 5000000
        });

    });