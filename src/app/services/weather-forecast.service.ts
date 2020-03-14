import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WeatherForecastService {

  //url of teleport api to get cities for the autocomplete input
  private citiesUrl = 'https://api.teleport.org/api/cities/';

  // application Id to access openweathermap apis
  private appId = '0e1fa1ba0e295693c6b8996b69055e18';
  //url of openweathermap api to get current weather
  private currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http : HttpClient) {
    //initiate the http client
    this.http = http;
  }

  /**this method is to get cities that returns an Observable from the teleport api based on search
   * in format JSON and it needs 2 parameters:search and limit(count of data per request)
   */
  getCities(search : string, limit : number): Observable<any> {
    const headers = new HttpHeaders({'Content-Type' : 'application/json'});
    const params = new HttpParams()
      .set('search', search)
      .set('limit', limit.toString());
    return this.http.get(this.citiesUrl,{headers : headers, params: params});
  }

  /**this method is to get current weather that returns an Observable from the openweathermap
   * current weather api based on search it needs 2 parameters:q and APPID
   */
  getCurrentWeather(search : string): Observable<any> {
    //const headers = new HttpHeaders({'Content-Type' : 'application/json'});
    const params = new HttpParams()
      .set('q', search)
      .set('APPID', this.appId);
    return this.http.get(this.currentWeatherUrl,{/*headers : headers,*/ params: params});
  }

}
