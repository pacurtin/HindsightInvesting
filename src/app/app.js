
angular.module('hindsightinvesting', [
  'ngRoute',
  'hindsightinvesting.todo',
  'hindsightinvesting.investments'
])
.config(function ($routeProvider) {
  'use strict';
  $routeProvider
    .when('/todo', {
      controller: 'TodoCtrl',
      templateUrl: '/hindsightinvesting/todo/todo.html'
    })
    .when('/investments', {
      controller: 'InvestmentsCtrl',
      templateUrl: '/hindsightinvesting/investments/investments.html'
    })
    .otherwise({
      redirectTo: '/investments'
    });
});
