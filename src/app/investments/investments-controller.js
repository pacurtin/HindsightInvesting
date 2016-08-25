
angular.module('hindsightinvesting.investments').controller('InvestmentsCtrl', ['$scope', '$window','InvestmentsService', function ($scope, $window, InvestmentsService) {
  'use strict';

  $scope.formFields = {};     //declaring my own scope to allow 2 way binding and form work together.
  $scope.formFields.stockTicker='GOOG'; //clear inputs. date picker seems to clear itself.
  $scope.formFields.amount=500;//todo delete

  var sysdate=new Date('2016-08-20T00:00:00.000Z') //todo replace this

  var adjCloseArray = null;   //TODO investigate if declaring these here is bad practice. is this like using global variables?
  var datesArray  = null;
  var javaScriptDatesArray = null;
  var nearestDate = null;
  var nearestDateIndex = null;

  var investmentSeries= []; //will use this to keep track of data points for each series. summing them will give true graph series. Also by keeping track of them we can delete investments and recalculate graph line.

  /*User investment choice input table*/

  /*$scope.investments = [
    {name:'GOOG', date:new Date('2015-08-16T00:00:00.000Z'), amount: 50},
    {name:'AAPL', date:new Date('2009-11-23T00:00:00.000Z'), amount: 100},
    {name:'GE', date:new Date('1999-01-20T00:00:00.000Z'), amount: 25}
  ];*/
  $scope.investments = [];

  $scope.addInvestment = function(){
    var stockData = retrieveStockData($scope.formFields.stockTicker);
    extractRelevantStockInfo(stockData);


    var investment = {
      name:$scope.formFields.stockTicker,     //Abbreviation used to uniquely identify publicly traded shares of a particular stock on a particular stock market.
      date:$scope.formFields.date,            //Date user has selected in the GUI.
      nearestDate:javaScriptDatesArray[nearestDateIndex],         //Closest date in data to user selection. JS date object.
      amount:$scope.formFields.amount,        //Amount in euro invested.
      adjCloseArray:adjCloseArray,     //Stock data from Yahoo. Stock's closing price on any given day of trading that has been amended to include any distributions and corporate actions.
      datesArray:datesArray,      //Dates corresponding to adjCloseArray entries.
      javaScriptDatesArray:javaScriptDatesArray,     //Same as datesArray except in JavaScript Date format. Needed for finding nearestDateIndex. Might be useful for other stuff too.
      nearestDateIndex:nearestDateIndex   //This stores the index of javaScriptDatesArray (and by extension of datesArray) which is closest to 'date'.
    };
    $scope.investments.push(investment);      //Persist investment data

    var earliestDate = findEarliestDate($scope.investments);
    //createInvestmentSeries(stockObject);  //Construct data points for graph. Need to combine individual investments into overall portfolio.
    prepareGraphData(earliestDate,$scope.investments); //Create labels for graph. Need a date for every friday between the earliest investment and the current date. Then fill a second series corrosponding to portfolio values on each date.
    //drawGraph(dataArray,datesArray); //strips down labels. Redraw graph.

    //$scope.formFields.stockTicker=''; //clear inputs. date picker seems to clear itself.
    //$scope.formFields.amount='';
    $scope.formFields.stockTicker='GOOG'; //clear inputs. date picker seems to clear itself.
    $scope.formFields.amount=500;
  }

  $scope.removeInvestment = function(index){
    $scope.investments.splice(index, 1);
  };


  /*Other Stuff*/

  function retrieveStockData(ticker) {
    //e.g. ticker = 'GOOG'
    //InvestmentsService.getStockData(ticker).then(function (results) {
    //  return JSON.parse($scope.UTIL.csv2Json(results.data.slice(0, -1)));  //need to slice off a return at end of data.
    //});
    return JSON.parse(JSON.stringify($scope.testJson));
  }


  function extractRelevantStockInfo(stockJsonArray){
    //var adjCloseArray =[];
    //var datesArray =[];
    adjCloseArray =[];
    datesArray =[];

    for (var key in stockJsonArray) {
      if (stockJsonArray.hasOwnProperty(key)) {
        adjCloseArray.push(stockJsonArray[key]['Adj Close']);
        datesArray.push(stockJsonArray[key].Date);
      }
    }

    adjCloseArray=adjCloseArray.reverse();  //TODO Optimise. Surely this is unnecessary extra work.
    datesArray=datesArray.reverse();
    javaScriptDatesArray = convertStringDatesToJsDates(datesArray);
    nearestDateIndex = getNearestDateIndex(adjCloseArray, new Date($scope.formFields.date));
    //$scope.nearestDate=stockObject.dataArray[0]; //it works!!!
  }

  function convertStringDatesToJsDates(datesArray){
    var dateObjects = [];
    for(var i=0;i<datesArray.length;i++){
      var date = new Date(datesArray[i]+'T00:00:00.000Z');
      dateObjects.push(date);
    }
    return dateObjects;
  }

  function getNearestDateIndex(datesArray,testDate){
    //Yahoo returns the entire history of the stock. We need to find the nearest entry in the data to the date of investment chosen by the user.
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

  function findEarliestDate(investments){
    var earliestDate = new Date('2016-08-20T00:00:00.000Z');         //initialise earliest date to today. //TODO replace

    for(var i = 0; i < investments.length; ++i){
      if(investments[i].nearestDate < earliestDate){    //then cycle through investments to find chronologically earliest.
        earliestDate=investments[i].nearestDate;
      }
    }

    //for (var investment in investments) {
    //  if(investment.nearestDate < earliestDate){    //TODO find out why this doesn't work
    //    earliestDate=investment.nearestDate;
    //  }
    //}
    return earliestDate;
  }

  function createInvestmentSeries(stockObject){
    var series = {};
    for(var i = stockObject.nearestDateIndex; i<stockObject.dateObjectArray.length;i++){
      series[stockObject.dateObjectArray[i]]=stockObject.dataArray[i];
    }
    $scope.nearestDate=stockObject.dateObjectArray[stockObject.dateObjectArray.length];
    investmentSeries.push(series);
  }

  function prepareGraphData(earliestDate,investments){
    //1.set labels array. start at earliest date. add label for every friday between earliest and today. possibly set data array here too? each set to zero
    var labels=[];
    var totalValueArray=[];

    //while(earliestDate<sysdate){
      labels.push(earliestDate);
      totalValueArray.push(0);
      incrementDate(earliestDate); //apparently javascript date doesnt come with this... have no internet on plane so just going to write it myself.
    //}


    //2.iterate through labels adding (amount1*price1)+(amount2*price2)+(amount3*price3) at each point

    //3.one more sweep setting any zero values to match previous. this should prevent days with missing data skrewing up the graph.
  }

  function incrementDate(dateIn) {
    //todo leap year or replace this altogether

    var day =dateIn.getDay();
    var month =dateIn.getMonth();
    var year =dateIn.getYear();

    var dayUTC =dateIn.getUTCDay();
    var monthUTC =dateIn.getUTCMonth();
    var yearUTC =dateIn.getUTCFullYear();

    var dateOut = new Date('2016-08-20T00:00:00.000Z');
    //dateOut = dateOut.setFullYear(year,month,day);
    dateOut = dateOut.setUTCFullYear(yearUTC,monthUTC,dayUTC).toISOString();


  }

  /*ChartJS Stuff*/

  function drawGraph(dataArray,labelsArray){
    $scope.data=[];
    $scope.labels=[];   //clear existing graph
    $scope.data.push(dataArray);  //chartJS data is in the form of [[series1],[series2]]. Effectively a multi dimensional array.
    $scope.labels=labelsArray;

    if($scope.labels.length>50){
      var stepSize = Math.round($scope.labels.length/50);     //this is to stop too many labels showing up on X-axis of graph. They should really build this into chartJS.
      for(var i= 0; i<$scope.labels.length; i++){
        if(i%stepSize!==0){
          $scope.labels[i]='';
        }
      }
    }
  }

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



  /*Some test data*/

  $scope.testJson=[
    {
      'Date':'2016-07-29',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'30.790001',
      'Volume':'33991200',
      'Adj Close':'31.790001'
    },
    {
      'Date':'2016-08-05',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'37.790001',
      'Volume':'33991200',
      'Adj Close':'30.790001'
    },
    {
      'Date':'2016-08-12',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'50.790001',
      'Volume':'33991200',
      'Adj Close':'34.790001'
    },
    {
      'Date':'2016-08-19',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'32.790001',
      'Volume':'33991200',
      'Adj Close':'32.790001'
    }
  ];

}]);
