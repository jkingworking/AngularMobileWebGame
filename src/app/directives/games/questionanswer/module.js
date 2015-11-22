(function ()
{

    'use strict';

    angular.module('directive.games.questionAnswer', [])
        .directive('gameQuestionAnswer', function ()
        {
            return {
                restrict    : 'EA',
                replace     : true,
                templateUrl : 'directives/games/questionanswer/template.html',
                controller  : 'gameQuestionAnswerController',
                scope       : {
                    gameData : '='
                }
            };
        })
        .controller('gameQuestionAnswerController', function ($scope, $rootScope, $http, ModalService, _apiUrlBase)
        {
            console.log('gameData', $scope.gameData);

            var gameTimerTimeout;
            var postData = {activities : [], gameId : $scope.gameData.id};

            $rootScope.currentQuestion = 0;
            $rootScope.gameTimer = $rootScope._gameTimerDefault;
            $rootScope.timerRunning = true;
            $rootScope._bodyClass += ' question-answer-game';
            if (!gameTimerTimeout)
            {
                $rootScope.timerCountDown();
            }

            $rootScope.$watch('currentQuestion', function (nv, ov)
            {
                if (!angular.equals(nv, ov))
                {
                    $rootScope.gameTimer = $rootScope._gameTimerDefault;
                    if (!$rootScope.timerRunning)
                    {
                        $rootScope.timerRunning = true;
                        $rootScope.timerCountDown();
                    }
                }
            });

            $scope.selectAnswer = function (parentIndex, index, value, playClick)
            {

                if (playClick)
                {
                    $rootScope._soundEffects.click.play();
                }
                $scope.currentActivity = $scope.gameData.activities[parentIndex];
                $scope.selectedAnswer = index;
                postData.activities[0] = {
                    id        : $scope.currentActivity.id,
                    questions : [
                        {
                            id    : $scope.currentActivity.questions[$rootScope.currentQuestion].id,
                            value : value
                        }
                    ]
                };
                $rootScope.stopTimer();
                $scope.submitAnswer();
            };

            $scope.submitAnswer = function ()
            {
                var question = $scope.currentActivity.questions[$rootScope.currentQuestion];
                $rootScope.timerRunning = false;

                // Send off the answer to the server
                $http.post(_apiUrlBase + 'v1/game/play/' + $scope.gameData.id, postData);

                $rootScope.modalData = {
                    'reward_amount' : $scope.currentActivity.reward_amount,
                    'reward_type'   : $scope.currentActivity.reward_type,
                    'action'        : 'nextQuestion',
                    'button'        : {
                        'text'       : 'Continue',
                        'icon_class' : 'fa fa-angle-right float-right'
                    }
                };

                if (question.answers[$scope.selectedAnswer] && question.answers[$scope.selectedAnswer].correct)
                {
                    $rootScope._soundEffects.correct.play();
                    $rootScope.modalData.title = 'Correct!';
                    $rootScope.modalData.message = 'Great job, keep up the good work.';
                }
                else
                {
                    $rootScope._soundEffects.incorrect.play();
                    $rootScope.modalData.title = 'Sorry, no.';
                    $rootScope.modalData.message = 'The correct answer is, ' + correctAnswer();
                    $rootScope.modalData.reward_amount = 0;
                    $rootScope.modalData.button.text = 'Try Another';
                }

                if ($rootScope.currentQuestion >= $scope.currentActivity.questions.length - 1)
                {
                    $rootScope.modalData.button.text = 'All Done';
                    $rootScope.modalData.button.icon_class = '';
                    $rootScope.modalData.action = 'backToGames';
                }

                ModalService.showModal({
                    templateUrl : "views/modals/question_complete.html",
                    controller  : "modalGameComplete"
                }).then(function (modal)
                {
                    modal.element.modal({
                        backdrop : 'static',
                        keyboard : false
                    });
                });

                $scope.selectedAnswer = null;
            };

            function correctAnswer()
            {
                var question = $scope.currentActivity.questions[$rootScope.currentQuestion];
                for (var i in question.answers)
                {
                    if (question.answers[i].correct)
                    {
                        return question.answers[i].label;
                    }
                }
                return false;
            }

            $scope.$on('timerEnded', function (event, args)
            {
                $scope.selectAnswer('0', -1, null, false);
            });

            $scope.$on('$destroy', function ()
            {
                $rootScope.stopTimer();
                $rootScope.gameTimer = $rootScope._gameTimerDefault;
            });
        });
})();