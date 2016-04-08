/**
 * Created by padraig.curtin on 06/04/2016.
 */

angular.module('hindsightinvesting.investments').factory('InvestmentsService',['$http',function InvestmentsService($http) {
  'use strict';
  var countries = [
    {name: 'USA',code: 'us'},
    {name: 'UK',code: 'uk'},
    {name: 'France',code: 'fr'}
  ];


      // ref: http://stackoverflow.com/a/1293163/2343
      // This will parse a delimited string into an array of
      // arrays. The default delimiter is the comma, but this
      // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = (strDelimiter || ",");

      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
        (
          // Delimiters.
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
          "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
      );


      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];

      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;


      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
          strMatchedDelimiter.length &&
          strMatchedDelimiter !== strDelimiter
        ){

          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push( [] );

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          strMatchedValue = arrMatches[ 2 ].replace(
            new RegExp( "\"\"", "g" ),
            "\""
          );

        } else {

          // We found a non-quoted value.
          strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
      }

      // Return the parsed data.
      return( arrData );
    }

  function myFunc( data ){
    console.log( data.title ); // Logs "jQuery Howto"
  }

  return {
    getCountries: function () {
      return countries;
    },
    /*getStockData: function (stockName) {
      return $http.jsonp('http://jsonplaceholder.typicode.com/posts/1?callback=JSON_CALLBACK"').success(function(data){
        console.log(data);});
    }*/
    getStockData: function (stockName) {
      return $http.jsonp('http://ichart.finance.yahoo.com/table.csv?s=GE&g=w').success(function(data){
        //console.log(CSVToArray(data));});
        data=data.substring(100,150);
        console.log(data);});
    }
  };

}]);
