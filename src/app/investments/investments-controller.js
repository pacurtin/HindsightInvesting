
angular.module('hindsightinvesting.investments').controller('InvestmentsCtrl', ['$scope', '$window','InvestmentsService', function ($scope, $window, InvestmentsService) {
  'use strict';

  //$scope.formFields.stockTicker = 'GE';
  $scope.formFields = {};     //declaring my own scope to allow 2 way binding and clearNatForm() work together.
  $scope.retrieveStockData = retrieveStockData;
  $scope.extractRelevantStockInfo = extractRelevantStockInfo;

  //TODO refactor this to return a data array rather than just altering $scope.data and $scope.labels
  //function to take the closing price from the JSON recieved and put it in an array for chartJS to display
  function extractRelevantStockInfo(stockJsonArray){
    var labelsArray = []; //pushing each label directly into $scope.labels was causing problems.
    $scope.labels=[];   //clear existing graph
    var dataArray=[]; //chartJS data is in the form of [[series1],[series2]]. Effectively a multi dimensional array.
    $scope.data=[];

    for (var key in stockJsonArray) {
      if (stockJsonArray.hasOwnProperty(key)) {
        labelsArray.push(stockJsonArray[key].Date);
        dataArray.push(stockJsonArray[key]["Adj Close"]);
      }
    }

    dataArray=dataArray.reverse();
    labelsArray=labelsArray.reverse();

    $scope.data.push(dataArray);
    $scope.labels=labelsArray;

    if($scope.labels.length>50){
      var stepSize = Math.round($scope.labels.length/50);     //this is to stop too many labels showing up on X-axis of graph
      for(var i= 0; i<$scope.labels.length; i++){
        if(i%stepSize!=0){
          $scope.labels[i]="";
        }
      }
    }
  }

  function retrieveStockData() {
    var stockTicker = 'GOOG';
    var stockTicker = $scope.formFields.stockTicker;
    //var stockTicker = form;
      //var stockTicker = 'FB';

      InvestmentsService.getStockData(stockTicker).then(function (results) {
        $scope.stockDataJson = JSON.parse($scope.UTIL.csv2Json(results.data.slice(0, -1)));  //need to slice off a return at end of data.
        extractRelevantStockInfo($scope.stockDataJson);
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
      "Adj Close":"31.790001"
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
      "Adj Close":"32.790001"
    },
    {
      "Date":"2016-04-18",
      "Open":"31.690001",
      "High":"31.709999",
      "Low":"30.51",
      "Close":"50.790001",
      "Volume":"33991200",
      "Adj Close":"34.790001"
    },
    {
      "Date":"2016-04-25",
      "Open":"31.690001",
      "High":"31.709999",
      "Low":"30.51",
      "Close":"32.790001",
      "Volume":"33991200",
      "Adj Close":"32.790001"
    }
  ];

  $scope.chartOptions= {
    bezierCurve : false,
    pointDot : false,
    animation: false,
    scaleShowHorizontalLines: false,
    scaleShowVerticalLines: false,
    showTooltips: false
  }

  $scope.labels = ['May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April', 'May', 'June', 'July', 'February', 'March', 'April'];
  //$scope.series = ['Investing', 'Saving'];
  $scope.series = ['Investing'];

  $scope.data = [[59, 80, 81, 56, 55, 40,65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80]];
  /*$scope.data = [
    //[65, 59, 80, 81, 56, 55, 40],
    //[28, 48, 40, 19, 86, 27, 90]
    [59, 80, 81, 56, 55, 40,65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40]
  ];*/


  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };




}]);
