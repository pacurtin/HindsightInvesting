angular.module('hindsightinvesting.investments', []);

/**
 * Created by padraig.curtin on 06/04/2016.
 */

angular.module('hindsightinvesting.investments').factory('InvestmentsService',['$http',function InvestmentsService($http) {
  'use strict';

  return {
    /*getStockData: function (stockTicker) {
      return $http.jsonp('http://jsonplaceholder.typicode.com/posts/1?callback=JSON_CALLBACK"').success(function(data){
        console.log(data);});
    }*/
    getStockData: function (stockTicker) {
      return $http.get('http://localhost:8000/getIndividualStockData', {params: { stockTicker: stockTicker }}).success(function(data){
        data=data.substring(42,data.length);
        //console.log(data);
      });
    }
  };

}]);


angular.module('hindsightinvesting.investments').controller('InvestmentsCtrl', ['$scope', '$window','InvestmentsService', function ($scope, $window, InvestmentsService) {
  'use strict';

  $scope.formFields = {};     //declaring my own scope to allow 2 way binding and form work together.
  $scope.formFields.stockTicker='GOOG'; //clear inputs. date picker seems to clear itself.
  $scope.formFields.amount=500;//todo delete
  $scope.formFields.date = new Date('2010-01-30T00:00:00.000Z');  //setting a default date avoids errors

  $scope.maxDate = new Date();
  $scope.dateSelectionTooOldFlag = false;

  var adjCloseArray = null;
  var datesArray  = null;
  var javaScriptDatesArray = null;
  var nearestDateIndex = null;
  var datesAndValuesDictionary = null;


  /*TODO
  1.Host on Heroku.
  2.Date cant be changed manually.
  3.Bootstrap CSS stuff. Make it look cool + make graph open and close depending on if any investments have been made or not.
  4.Ticker not on Yahoo check.
   */

  /*User investment choice input table*/

  $scope.investments = [];
  $scope.totalInvested = 0;
  $scope.currentValue = 0;

  $scope.addInvestment = function(){
    var results = retrieveStockData($scope.formFields.stockTicker).then(function (results) {   //.then uses promise chain to solve asynchronous call problem
      if(results == "Stock not found"){
        $window.alert("Entry not valid because stock not found on Yahoo finance. Examples of valid choices include 'Goog', 'AAPL' and 'MSFT'.");
      }else{
        $scope.totalInvested = $scope.totalInvested + $scope.formFields.amount;
        extractRelevantStockInfo(results);
        var investment = {
          name:$scope.formFields.stockTicker,                 //Abbreviation used to uniquely identify publicly traded shares of a particular stock on a particular stock market.
          date:$scope.formFields.date,                        //Date user has selected in the GUI.
          nearestDate:javaScriptDatesArray[nearestDateIndex], //Closest date in data to user selection. JS date object.
          amount:$scope.formFields.amount,                    //Amount in euro invested.
          sharesPurchased:$scope.formFields.amount/datesAndValuesDictionary[nearestMonday(javaScriptDatesArray[nearestDateIndex])],   //number of shares bought for "amount" euros on "date"
          adjCloseArray:adjCloseArray,                        //Stock data from Yahoo. Stock's closing price on any given day of trading that has been amended to include any distributions and corporate actions.
          datesArray:datesArray,                              //Dates corresponding to adjCloseArray entries.
          javaScriptDatesArray:javaScriptDatesArray,          //Same as datesArray except in JavaScript Date format. Needed for finding nearestDateIndex. Might be useful for other stuff too.
          nearestDateIndex:nearestDateIndex,                  //This stores the index of javaScriptDatesArray (and by extension of datesArray) which is closest to 'date'.
          datesAndValuesDictionary:datesAndValuesDictionary,  //Using date as a key will return the closing price of that day.
          dateSelectionTooOldFlag:$scope.dateSelectionTooOldFlag,  //Use to inform user they have selected a date that is too far in the past for their chosen stock.
          tickerDoesntExistFlag:false                         //Use to inform user they have selected a ticker that doesn't exist.
        };
        $scope.investments.push(investment);                  //Persist investment data
        var earliestDate = findEarliestDate($scope.investments);
        prepareGraphDataAndDrawGraph(earliestDate,$scope.investments);    //Create labels for graph. Need a date for every monday between the earliest investment and the current date. Then fill a second series corrosponding to portfolio values on each date.
        updateCurrentValue();
      }
      //$scope.formFields.stockTicker='';                   //clear inputs. date picker seems to clear itself.
      //$scope.formFields.amount='';
      $scope.formFields.stockTicker='GOOG'; //clear inputs. date picker seems to clear itself.
      $scope.formFields.amount=500;
    });
  };

  $scope.removeInvestment = function(index){
    $scope.totalInvested = $scope.totalInvested - $scope.investments[index].amount;
    $scope.investments.splice(index, 1);
    var earliestDate = findEarliestDate($scope.investments);
    prepareGraphDataAndDrawGraph(earliestDate,$scope.investments);
    updateCurrentValue();

  };


  /*Other Stuff*/

  function retrieveStockData(ticker) {
    //e.g. ticker = 'GOOG'
    return InvestmentsService.getStockData(ticker).then(function (results) {
      if(results.data == "Stock not found"){
        return "Stock not found";
      }else{
        return JSON.parse($scope.UTIL.csv2Json(results.data.slice(0, -1)));  //need to slice off a return at end of data.
      }

    });
    //return JSON.parse(JSON.stringify($scope.testJson));
  }


  function extractRelevantStockInfo(stockJsonArray){
    adjCloseArray =[];
    datesArray =[];
    datesAndValuesDictionary = {};

    for (var key in stockJsonArray) {
      if (stockJsonArray.hasOwnProperty(key)) {
        adjCloseArray.push(stockJsonArray[key]['Adj Close']);
        datesArray.push(stockJsonArray[key].Date);
        datesAndValuesDictionary[nearestMonday(convertStringDateToJsDate(stockJsonArray[key].Date))]=stockJsonArray[key]['Adj Close'];
        //datesAndValuesDictionary[convertStringDateToJsDate(stockJsonArray[key].Date)]=stockJsonArray[key]['Adj Close'];
      }
    }

    adjCloseArray = adjCloseArray.reverse();  //TODO Optimise. Surely this is unnecessary extra work.
    datesArray = datesArray.reverse();
    javaScriptDatesArray = convertStringDatesToJsDates(datesArray);
    nearestDateIndex = getNearestDateIndex(javaScriptDatesArray, new Date($scope.formFields.date));
    //$scope.nearestDate = stockObject.dataArray[0]; //it works!!!
  }

  function convertStringDatesToJsDates(datesArray){
    var dateObjects = [];
    for(var i=0;i<datesArray.length;i++){
      var date = new Date(datesArray[i]+'T00:00:00.000Z');
      dateObjects.push(date);
    }
    return dateObjects;
  }

  function convertStringDateToJsDate(dateString){
    var date = new Date(dateString+'T00:00:00.000Z');
    return date;
  }

  function convertJsDateToStringDate(jsDate){
    var dd = jsDate.getDate().toString();
    if(dd.length==1)dd=[0,dd].join('');
    var mm = (jsDate.getMonth()+1).toString();
    if(mm.length==1)mm=[0,mm].join('');
    var yyyy = jsDate.getFullYear().toString();

    return [dd,mm,yyyy].join("-");
  }

  function getNearestDateIndex(datesArray,datePickerDate){
    //Yahoo returns the entire history of the stock. We need to find the nearest entry in the data to the date of investment chosen by the user.
    $scope.dateSelectionTooOldFlag = false;
    var bestDate = datesArray.length;
    var bestDiff = -(new Date(0,0,0)).valueOf();
    var currDiff = 0;
    var i;

    for(i = 0; i < datesArray.length; ++i)
    {
      currDiff = Math.abs(datesArray[i] - datePickerDate);
      if(currDiff < bestDiff)
      {
        bestDate = i;
        bestDiff = currDiff;
      }
    }

    if(bestDate==0){
        $scope.dateSelectionTooOldFlag = true;              //user selected date predating the stocks earliest entry in Yahoos data. Warn them selection defaults to earliest available date.
        $scope.formFields.date = datesArray[0];
    }
    return bestDate;
  }

  function findEarliestDate(investments){
    var earliestDate = new Date();         //initialise earliest date to today.

    for(var i = 0; i < investments.length; ++i){
      if(investments[i].nearestDate < earliestDate){    //then cycle through investments to find chronologically earliest.
        earliestDate=investments[i].nearestDate;
      }
    }

    return earliestDate;
  }

  function prepareGraphDataAndDrawGraph(earliestDate,investments){
    //1.set labels array. start at earliest date. add label for every monday between earliest and today. Set data values array here too
    var dateLabel=nearestMonday(earliestDate); //date label must be a monday
    var dateLabels=[];  //dates for x axis
    var dateValues=[];  //portfolio value on this date, y axis.
    var value=0;
    var currDate= new Date();

    while(dateLabel<currDate){
      dateLabels.push(convertJsDateToStringDate(dateLabel));

      value=0;
      for(var i = 0; i < investments.length; ++i) {
        if(dateLabel >= investments[i].date){  //if date is before investment is made its not added to total for that date
          value = value + (investments[i].sharesPurchased * (investments[i].datesAndValuesDictionary[dateLabel]));    //need dictionary e.g. date1:adjClose1 , date2:adjClose2 etc...
        }
      }

      dateValues.push(value);
      dateLabel = addDays(dateLabel, 7);
    }

    //do a sweep setting any zero values to match previous. this should prevent days with missing data screwing up the graph.//TODO test with extended data

    $scope.data=[];
    $scope.labels=[];   //clear existing graph
    $scope.data.push(dateValues);  //chartJS data is in the form of [[series1],[series2]]. Effectively a multi dimensional array. Each array is a line series.
    $scope.labels=stripDownLabels(dateLabels);

  }

  function nearestMonday(date) {
    var day = date.getDay() || 7;
    if( day !== 1 )
        date.setHours(-24 * (day - 1));
    return new Date(date.setHours(0, 0, 0, 0));
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /*ChartJS Stuff*/

  function stripDownLabels(labels){

    if(labels.length>50){
      var stepSize = Math.round(labels.length/50);     //this is to stop too many labels showing up on X-axis of graph. They should really build this into chartJS.
      for(var i= 0; i<labels.length; i++){
        if(i%stepSize!==0){
          labels[i]='';
        }
      }
    }

    return labels;
  }

  function updateCurrentValue() {
    if($scope.data[0].slice(-1)[0])
      $scope.currentValue=$scope.data[0].slice(-1)[0];
    else
      $scope.currentValue=0;
  }

  $scope.chartOptions= {
    bezierCurve : false,
    pointDot : false,
    animation: false,
    scaleShowHorizontalLines: false,
    scaleShowVerticalLines: false,
    showTooltips: false
  };

  $scope.series = ['Portfolio Value'];

  /*Some test data*/

  $scope.testJson=[
    {
      'Date':'2016-09-26',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'30.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    },
    {
      'Date':'2016-09-19',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'37.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    },
    {
      'Date':'2016-09-12',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'50.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    },
    {
      'Date':'2016-09-05',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'32.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    }
  ];

}]);

var app = angular.module('hindsightinvesting', [
  'ui.bootstrap',
  'ngRoute',
  'chart.js',
  'hindsightinvesting.investments',
  'ngMaterial'
])
  .config(["$routeProvider", function ($routeProvider) {
    'use strict';

    $routeProvider
      .when('/investments', {
        controller: 'InvestmentsCtrl',
        templateUrl: '/hindsightinvesting/investments/investments.html'
      })
      .otherwise({
        redirectTo: '/investments'
      });
  }]);

  app.run(["$rootScope", function($rootScope) {
    //app util functions
    $rootScope.UTIL = {

      toFilename: function(filename) {
        return filename
          .toLowerCase()
          .replace(/ /g,'-')
          .replace(/[^\w-]+/g,'');
      },

      fromFilename: function(filename) {
        return filename
          .toLowerCase()
          .replace(/[^\w ]+/g,'')
          .replace(/ +/g,'-');
      },

      // Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
      // This will parse a delimited string into an array of
      // arrays. The default delimiter is the comma, but this
      // can be overriden in the second argument.

      csv2Json: function CSV2JSON(csv) {

        function CSVToArray(strData, strDelimiter) {
          // Check to see if the delimiter is defined. If not,
          // then default to comma.
          strDelimiter = (strDelimiter || ",");
          // Create a regular expression to parse the CSV values.
          var objPattern = new RegExp((
            // Delimiters.
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
          "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
          // Create an array to hold our data. Give the array
          // a default empty first row.
          var arrData = [[]];
          // Create an array to hold our individual pattern
          // matching groups.
          var arrMatches = null;
          // Keep looping over the regular expression matches
          // until we can no longer find a match.
          while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
              // Since we have reached a new row of data,
              // add an empty row to our data array.
              arrData.push([]);
            }
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
              // We found a quoted value. When we capture
              // this value, unescape any double quotes.
              var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");
            } else {
              // We found a non-quoted value.
              var strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
          }
          // Return the parsed data.
          return (arrData);
        }

        var array = CSVToArray(csv);
        var objArray = [];
        for (var i = 1; i < array.length; i++) {
          objArray[i - 1] = {};
          for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
          }
        }

        var json = JSON.stringify(objArray);
        var str = json.replace(/},/g, "},\r\n");

        return str;
      },

      csvToArray: function CSVToArray(strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
          // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
          // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
          // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
          // Get the delimiter that was found.
          var strMatchedDelimiter = arrMatches[1];
          // Check to see if the given delimiter has a length
          // (is not the start of string) and if it matches
          // field delimiter. If id does not, then we know
          // that this delimiter is a row delimiter.
          if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
          }
          // Now that we have our delimiter out of the way,
          // let's check to see which kind of value we
          // captured (quoted or unquoted).
          if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
              new RegExp("\"\"", "g"), "\"");
          } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
          }
          // Now that we have our value string, let's add
          // it to the data array.
          arrData[arrData.length - 1].push(strMatchedValue);
        }
        // Return the parsed data.
        return (arrData);
      }

    };

  }]);

(function(module) {
try {
  module = angular.module('hindsightinvesting');
} catch (e) {
  module = angular.module('hindsightinvesting', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/hindsightinvesting/investments/investments.html',
    '<div class="col-xs-12" style="height:30px"></div><div class="row"><div class="col-xs-offset-2 col-xs-2 text-center"><strong>Total Invested</strong></div><div class="col-xs-offset-4 col-xs-2 text-center"><strong>Value Today</strong></div></div><div class="row"><div class="col-xs-offset-2 col-xs-2 text-center img-rounded" style="border: 2px solid">${{totalInvested}}</div><div class="col-xs-offset-4 col-xs-2 text-center img-rounded" style="border: 2px solid">${{currentValue}}</div></div><div class="col-xs-12" style="height:30px"></div><div class="row"><div class="col-xs-offset-1 col-xs-10 text-center img-rounded" style="border: 2px solid"><canvas id="line" class="chart chart-line" chart-data="data" chart-labels="labels" chart-legend="true" chart-series="series" chart-click="onClick" chart-options="chartOptions"></canvas></div></div><div class="col-xs-12" style="height:30px"></div><div class="row"><div class="col-xs-offset-1 col-xs-10 text-center img-rounded" style="border: 2px solid"><table class="table"><thead><tr><th>Stock Name</th><th>Date of Purchase</th><th>Amount(EURO)</th><th></th></tr></thead><tbody><tr><form novalidate class="simple-form"><td><input ng-model="formFields.stockTicker"><br></td><td><md-datepicker ng-model="formFields.date" md-placeholder="Enter date" md-max-date="maxDate"></md-datepicker></td><td><input type="number" ng-model="formFields.amount"><br></td><td><input class="btn btn-primary" type="submit" ng-click="addInvestment()" ng-disabled="formFields.stockTicker.length==0 || formFields.date.length==0 || formFields.amount.length==0" value="Add Investment"></td></form></tr><tr ng-repeat="investment in investments"><td>{{investment.name}}</td><td>{{investment.date | date:\'dd-MM-yyyy\'}}<h6 class="text-warning">{{investment.dateSelectionTooOldFlag ? \'Date may predate Yahoo data for stock.\' : \'\'}}</h6><h6 class="text-warning">{{investment.dateSelectionTooOldFlag ? \'Defaulting to earliest available date.\' : \'\'}}</h6></td><td>{{investment.amount}}</td><td><button type="button" class="btn btn-primary" ng-click="removeInvestment($index)">Remove Investment</button></td></tr></tbody></table></div></div>');
}]);
})();
