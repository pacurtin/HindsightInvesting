
angular.module('hindsightinvesting.investments').controller('InvestmentsCtrl', ['$scope', '$window','InvestmentsService', function ($scope, $window, InvestmentsService) {
  'use strict';

  $scope.formFields = {};     //declaring my own scope to allow 2 way binding and form work together.
  $scope.retrieveStockData = retrieveStockData;
  var investmentSeries= []; //will use this to keep track of data points for each series. summing them will give true graph series. Also by keeping track of them we can delete investments and recalculate graph line.

  //TODO refactor this to return a data array rather than just altering $scope.data and $scope.labels
  //function to take the closing price from the JSON recieved and put it in an array for chartJS to display
  function extractRelevantStockInfo(stockJsonArray){
    var datesArray = [];
    var dataArray=[];

    for (var key in stockJsonArray) {
      if (stockJsonArray.hasOwnProperty(key)) {
        datesArray.push(stockJsonArray[key].Date);
        dataArray.push(stockJsonArray[key]['Adj Close']);
      }
    }

    dataArray=dataArray.reverse();
    datesArray=datesArray.reverse();
    var dateObjectArray = convertStringDatesToJsDates(datesArray);

    //var closestDateToUserSelectionIndex = nearestDate(dateObjectArray,new Date("2016-04-12T23:00:00.000Z"));
    var nearestDateIndex = nearestDate(dateObjectArray,new Date($scope.formFields.date));

    var stockObject =
    {
      'dataArray':dataArray,
      'datesArray':datesArray,
      'dateObjectArray':dateObjectArray,
      'nearestDateIndex':nearestDateIndex
    };//contains all relevant data about stock in a usable JSON(i dont think json allows arrays like this?) format.

    //$scope.nearestDate=stockObject.dataArray[0]; //it works!!!
    createInvestmentSeries(stockObject);
    drawGraph(dataArray,datesArray); //strips down labels.
  }

  function createInvestmentSeries(stockObject){
    var series = {};
    for(var i = stockObject.nearestDateIndex; i<stockObject.dateObjectArray.length;i++){
      series[stockObject.dateObjectArray[i]]=stockObject.dataArray[i];
    }
    $scope.nearestDate=stockObject.dateObjectArray[stockObject.dateObjectArray.length];
    investmentSeries.push(series);
  }

  function convertStringDatesToJsDates(datesArray){
    var dateObjects = [];
    for(var i=0;i<datesArray.length;i++){
      //var date = new Date('2015-12-16T00:00:00.000Z');
      var date = new Date(datesArray[i]+'T00:00:00.000Z');
      dateObjects.push(date);
    }
    return dateObjects;
  }

  function nearestDate(datesArray,testDate){
    var bestDate = datesArray.length;
    var bestDiff = -(new Date(0,0,0)).valueOf();
    var currDiff = 0;
    var i;

    for(i = 0; i < datesArray.length; ++i)
    {
      currDiff = Math.abs(datesArray[i] - testDate);
      if(currDiff < bestDiff)
      {
        bestDate = i;
        bestDiff = currDiff;
      }
    }
    //var date = new Date('2015-12-16T00:00:00.000Z');
    return bestDate;
  }

  function retrieveStockData() {
    var stockTicker = 'GOOG';
    var stockTicker = $scope.formFields.stockTicker;
    InvestmentsService.getStockData(stockTicker).then(function (results) {
      $scope.stockDataJson = JSON.parse($scope.UTIL.csv2Json(results.data.slice(0, -1)));  //need to slice off a return at end of data.
      extractRelevantStockInfo($scope.stockDataJson);
    });

    addInvestmentToTable(); //do this last so the fields arn't reset before we use them in calculations
  }

  function addInvestmentToTable(){
    $scope.investments.push(
      {
        name:$scope.formFields.stockTicker,
        date:$scope.formFields.date,
        amount:$scope.formFields.amount
      }
    );

    $scope.formFields.stockTicker='';
    //$scope.formFields.date='';          //clear inputs
    $scope.formFields.amount='';
  }

  function drawGraph(dataArray,labelsArray){
    $scope.data=[];
    $scope.labels=[];   //clear existing graph
    $scope.data.push(dataArray);  //chartJS data is in the form of [[series1],[series2]]. Effectively a multi dimensional array.
    $scope.labels=labelsArray;

    if($scope.labels.length>50){
      var stepSize = Math.round($scope.labels.length/50);     //this is to stop too many labels showing up on X-axis of graph. They should really build this into chartJS.
      for(var i= 0; i<$scope.labels.length; i++){
        if(i%stepSize!=0){
          $scope.labels[i]='';
        }
      }
    }
  }

  $scope.investments = [
    {name:'GOOG', date:'19/12/2013', amount: 50}
    //{name:'AAPL', date:'23/11/2009', amount: 100},
    //{name:'GE', date:'20/01/1999', amount: 25}
  ];

  $scope.testJson=[
    {
      'Date':'2016-04-04',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'30.790001',
      'Volume':'33991200',
      'Adj Close':'31.790001'
    },
    {
      'Date':'2016-04-11',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'37.790001',
      'Volume':'33991200',
      'Adj Close':'30.790001'
    },
    {
      'Date':'2016-04-18',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'30.790001',
      'Volume':'33991200',
      'Adj Close':'32.790001'
    },
    {
      'Date':'2016-04-18',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'50.790001',
      'Volume':'33991200',
      'Adj Close':'34.790001'
    },
    {
      'Date':'2016-04-25',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'32.790001',
      'Volume':'33991200',
      'Adj Close':'32.790001'
    }
  ];

  $scope.chartOptions= {
    bezierCurve : false,
    pointDot : false,
    animation: false,
    scaleShowHorizontalLines: false,
    scaleShowVerticalLines: false,
    showTooltips: false
  };

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
