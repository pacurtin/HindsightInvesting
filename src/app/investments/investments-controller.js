
angular.module('hindsightinvesting.investments').controller('InvestmentsCtrl', ['$scope', '$window','InvestmentsService', function ($scope, $window, InvestmentsService) {
  'use strict';

  //$scope.formFields.stockName = 'GE';

  $scope.retrieveStockData = retrieveStockData;

  function retrieveStockData(form) {
      //var stockName = $scope.formFields.stockName;
      var stockName = 'GE';

      InvestmentsService.getStockData(stockName).then(function (results) {
        $scope.stockDataCSV = $scope.UTIL.csv2Json(results.data.slice(0, -1));  //need to slice off a return at end of data.
      });
  }
  $scope.testJson=[
    {
      "Date":"2016-04-04",
      "Open":"31.690001",
      "High":"31.709999",
      "Low":"30.51",
      "Close":"30.790001",
      "Volume":"33991200",
      "Adj Close":"30.790001"
    },
    {
      "Date":"2016-04-11",
      "Open":"31.690001",
      "High":"31.709999",
      "Low":"30.51",
      "Close":"37.790001",
      "Volume":"33991200",
      "Adj Close":"30.790001"
    },
    {
      "Date":"2016-04-18",
      "Open":"31.690001",
      "High":"31.709999",
      "Low":"30.51",
      "Close":"30.790001",
      "Volume":"33991200",
      "Adj Close":"30.790001"
    }
  ];

  $scope.labels = ['May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February'];
  $scope.series = ['Investing', 'Saving'];
  $scope.data = [
    //[65, 59, 80, 81, 56, 55, 40],
    //[28, 48, 40, 19, 86, 27, 90]
    [59, 80, 81, 56, 55, 40,65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40]
  ];


  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };




}]);
