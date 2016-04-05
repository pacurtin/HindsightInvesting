angular
  .module('hindsightinvesting.investments')
  .controller('InvestmentsCtrl', function ($scope, $window) {
    'use strict';
    $scope.todos = JSON.parse($window.localStorage.getItem('todos') || '[]');
    $scope.$watch('todos', function (newTodos, oldTodos) {
      if (newTodos !== oldTodos) {
        $window.localStorage.setItem('todos', JSON.stringify(angular.copy($scope.todos)));
      }
    }, true);

    $scope.add = function () {
      var todo = {label: $scope.label, isDone: false};
      $scope.todos.push(todo);
      $window.localStorage.setItem('todos', JSON.stringify(angular.copy($scope.todos)));
      $scope.label = '';
    };

    $scope.check = function () {
      this.todo.isDone = !this.todo.isDone;
    };



    $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February", "March", "April", "May", "June", "July", "February"];
    $scope.series = ['Investing', 'Saving'];
    $scope.data = [
      //[65, 59, 80, 81, 56, 55, 40],
      //[28, 48, 40, 19, 86, 27, 90]
      [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40,65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40],

    ];
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };
  });
