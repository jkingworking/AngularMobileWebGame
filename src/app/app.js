'use strict';

var modules = [
    'ngAnimate',
    'ngCookies',
    'ngRetina',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'LocalStorageModule',
    'angularAddToHomeScreen',
    'angular-carousel',
    'ui.bootstrap.datetimepicker',
    'countTo',
    'ordinal',
    'angularModalService',
    'timer',

    'salesDawg.templates',
    'service.auth',
    'service.user',

    'filter.moment',
    'filter.rewardtype',
    'filter.conditionFormatter',

    'directive.userAvatar',
    'directive.avatar',
    'directive.blurOnSubmit',
    'directive.carRace',
    'directive.games.questionAnswer',
    'directive.games.setAppointment',
    'directive.games.soldVehicle',
    'directive.games.testDrive',
    'directive.weekDayPicker',

    'view.login',
    'view.app',
    'view.signUp',
    'view.dashboard',
    'view.settings',
    'view.games',
    'view.game',
    'view.leaderBoard',
    'view.modal',
    'view.profile',
    'view.roadToSale',
    'view.feedback'
];

angular.module('mbsApp', modules)
    .config(function ($urlRouterProvider, $httpProvider)
    {
        $urlRouterProvider.otherwise('/dashboard');
        //$httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    })
    .run(function ($rootScope, localStorageService, $state, $http, $timeout)
    {
        var gameTimerTimeout;
        $rootScope._dev = (window.location.hostname.substring(0, 6) === 'local.');
        $rootScope._apiUrlBase = 'http://api.salesdawg.com/';
        $rootScope._baseUrl = 'http://salesdawg.com/';
        $rootScope._timeZone = 'America/Chicago';
        $rootScope._loginAttempts = 0;
        $rootScope._refreshTimeout = 20000;
        $rootScope._extendedDateFormat = 'MMMM Do, YYYY - h:mma z';
        $rootScope._dividerDateFormat = 'dddd - MMM D, YYYY';
        $rootScope._defaultAvatar = {'file_location' : '/assets/icons/Icon-60@3x.png'};
        $rootScope._showMenuBtn = true;
        $rootScope._showBackBtn = false;
        $rootScope._animationTime = 250;
        $rootScope.showingMenu = false;
        $rootScope._gameTimerDefault = 30;
        $rootScope._soundEffects = {
            button          : new Audio('/assets/sounds/button.wav'),
            click           : new Audio('/assets/sounds/click.wav'),
            clickEarnPoints : new Audio('/assets/sounds/click_earn_points.mp3'),
            close           : new Audio('/assets/sounds/close.wav'),
            correct         : new Audio('/assets/sounds/correct.mp3'),
            earnPoints      : new Audio('/assets/sounds/earn_points.mp3'),
            error           : new Audio('/assets/sounds/error.mp3'),
            gameOpen        : new Audio('/assets/sounds/game_open.mp3'),
            incorrect       : new Audio('/assets/sounds/incorrect.mp3'),
            notify          : new Audio('/assets/sounds/notify.wav'),
            open            : new Audio('/assets/sounds/open.wav'),
            success         : new Audio('/assets/sounds/success.mp3'),
            tick            : new Audio('/assets/sounds/tick.wav')
        };

        $http.get('/version.json').success(function (d)
        {
            $rootScope._version = d.version;
        });

        $rootScope._getBodyClass = function ()
        {
            return $rootScope._bodyClass || 'default';
        };

        $rootScope.$on('$stateChangeSuccess', function (ev, toState, toParams, from, fromParams)
        {
            $rootScope.timerRunning = false;
            window.scrollTo(0, 0);
            $rootScope._headerBtn = false;
            $rootScope.showingMenu = false;
            if (!from.abstract)
            {
                $rootScope._previousState = from.name;
                $rootScope._previousStateParams = fromParams;
            }

            if (angular.isDefined(toState.data.bodyClass))
            {
                $rootScope._bodyClass = toState.data.bodyClass;
            }

            $rootScope._stateTitle = toState.data.title || 'Sales Dawg';

            $rootScope._showMenuBtn = true;
            $rootScope._showBackBtn = false;
        });

        $rootScope.goBack = function ()
        {
            if($rootScope._backFunct === undefined)
            {
                var previousState = $rootScope._previousState || 'app.dashboard';
                var previousStateParams = $rootScope._previousStateParams;
                $state.go(previousState, previousStateParams);
            } else
            {
                $rootScope._backFunct();
            }
        };


        $rootScope.stopTimer = function ()
        {
            $rootScope.timerRunning = false;
            $timeout.cancel(gameTimerTimeout);
            gameTimerTimeout = undefined;
        };

        $rootScope.timerCountDown = function ()
        {
            gameTimerTimeout = $timeout(function ()
            {
                if ($rootScope.gameTimer > 0 && $rootScope.timerRunning)
                {
                    console.log('Timeout complete');
                    $rootScope.gameTimer = $rootScope.gameTimer - 1;

                    if ($rootScope.gameTimer <= 10 && $rootScope.gameTimer > 0)
                    {
                        $rootScope._soundEffects.tick.play();
                    }

                    if ($rootScope.gameTimer > 0)
                    {
                        $rootScope.timerCountDown();
                    }
                    else
                    {
                        $rootScope.stopTimer();
                        $rootScope.$broadcast('timerEnded');
                    }
                }
            }, 1000);
        };

    })
    .constant('aathsLocales', {
        'en' : {
            'iOS'   : 'For the best experience add SalesDawg to your home screen.',
            'close' : '<i class="fa fa-close"></i>'
        }
    });