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
      return $http.get('http://localhost:8000/listUsers', {params: { stockTicker: stockTicker }}).success(function(data){
        console.log(stockTicker);
        data=data.substring(42,data.length);
        //console.log(data);
      });
    }
  };

}]);
