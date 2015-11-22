(function ()
{
    'use strict';

    angular.module('directive.userAvatar', ['service.user'])
        .directive('userAvatar', function ()
        {
            return {
                restrict    : 'EA',
                replace     : true,
                templateUrl : 'directives/useravatar/template.html',
                controller  : 'userAvatarController'
            };
        })
        .controller('userAvatarController', function ($rootScope)
        {
            function loadAvatar()
            {
                var avatar = $rootScope.user.avatar.file_location || $rootScope._defaultAvatar.file_location;
                $rootScope.avatarBackground = {
                    'background-image' : 'url(' + avatar + ')'
                };
            }

            loadAvatar();
        });
})();