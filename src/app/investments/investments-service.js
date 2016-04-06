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

  return {
    getCountries: function () {
      return countries;
    },
    getStockData: function (stockName) {
      var key = '';
      return $http.jsonp('http://jsonplaceholder.typicode.com/posts/1?callback=JSON_CALLBACK"').success(function(data){
        console.log(data);});
    }
  };

}]);
