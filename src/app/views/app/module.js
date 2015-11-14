'use strict';

angular.module('view.app', [])
    .config(function ($stateProvider)
    {
        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'views/app/template.html',
                controller: 'appController',
                resolve: {
                    userData: function ($rootScope, userService)
                    {
                        console.log('Resolving App Route');
                        return userService.userInfo(true).then(function (userData)
                        {
                            console.log('userData', userData);
                            $rootScope.user = userData;
                        });
                    }
                }
            });
    })
    .controller('appController', function ($rootScope, $state, $scope, authService) {
        $scope.$state = $state;
        console.log('app state');

        $scope.mainMenu = [
            {
                title: 'Dashboard',
                state: 'app.dashboard',
                icon: 'fa fa-tachometer',
                badgeCount: false
            },
            {
                title: 'Leader Board',
                state: 'app.leaderBoard',
                icon: 'fa fa-trophy',
                badgeCount: false
            },
            {
                title: 'Road to Sale',
                state: 'app.roadToSale',
                icon: 'fa fa-road',
                badgeCount: false
            },
            {
                title: 'Games',
                state: 'app.games',
                icon: 'fa fa-plus-square',
                badgeCount: false
            },
            {
                title: 'Feedback',
                state: 'app.feedback',
                icon: 'fa fa-question-circle',
                badgeCount: false
            }
            //{
            //    title: 'Settings',
            //    state: 'app.settings',
            //    icon: 'fa fa-cog',
            //    badgeCount: false,
            //},
            //{
            //    title: 'Logout',
            //    state: 'logout',
            //    icon: 'fa fa-sign-out',
            //    badgeCount: false,
            //}
        ];
        $scope.secondaryMenu =[
            {
                title: 'Terms & Conditions',
                href: $rootScope._baseUrl + 'terms.php'
            },
            {
                title: 'Privacy',
                href: $rootScope._baseUrl + 'privacy.php'
            }

        ];

        $scope.toggleMenu = function () {
            $rootScope.showingMenu = !$rootScope.showingMenu;
        };

        $scope.hideMenu = function () {
            $rootScope.showingMenu = false;
        };

        $scope.showMenu = function () {
            $rootScope.showingMenu = true;
        };


        // Sound effects for the menu
        $scope.$watch('showingMenu', function (nv, ov)
        {
            if(nv !== ov)
            {
                if (nv)
                {
                    $rootScope._soundEffects.open.play();
                }
                else
                {
                    $rootScope._soundEffects.close.play();
                }
            }
        });

        $rootScope.$on('401', function () {
            if(!$rootScope._attemptingAutoLogin) {
                $rootScope._loading = true;
                authService.autoLogin().then(
                    function () {
                        $rootScope._loading = false;
                        if($rootScope._401Count < 10)
                        {
                            $state.reload();
                        } else
                        {
                            $state.go('login');
                        }
                    },
                    function () {
                        $rootScope._loading = false;
                        $state.go('login');
                    }
                );
            }
        });

    });