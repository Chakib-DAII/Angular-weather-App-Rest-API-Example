import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {debounceTime, finalize, map, startWith, switchMap, tap} from "rxjs/operators";
import {WeatherForecastService} from "../../services/weather-forecast.service";


@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit {

  //a required form control to input the city
  cityCtrl = new FormControl('',Validators.required);

  //array of type string to save returned cities in each request
  cities : string[] = [];
  //sectors to encode returned Wind Directions from openweathermap current weather api
  sectors : string[] = ["North","NNEast","NEast","ENEeast","East","ESEeast","SEeast","SSEast",
                        "South","SSWest","SWest","WSWest","West","WNWest","NWest","NNWest","North"];
  //variable to save the the encoded date
  currentDate: Date;
  //testing variables for loading and errors to makee a good UX,UI
  isLoading = false;
  isLoadingWeather = false;
  error =false;
  errorMsg: string;
  weatherLoaded = false;
  //variable to save the returned object from openweathermap current weather api
  currentWeather : any;
  //variable to save the picked location
  location: string;
  //base url to get the weather icon
  private iconUrl = 'http://openweathermap.org/img/wn/';

  constructor(private weatherService : WeatherForecastService) {

  }

  ngOnInit() {
    //this code is to initialise the form control of city with possible values based on input of user
    this.cityCtrl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        tap(() => {
          this.cities = [];
          this.isLoading = true;
        }),
        switchMap(value  => this.weatherService.getCities(value, 5)
          .pipe(
            finalize(() => {
              this.isLoading = false
            })
          )
        )
      ).subscribe(
      (response) =>{
        //console.log(response);
        this.cities = response._embedded["city:search-results"];
        //console.log(this.cities);
      },
      (error) =>{
        this.cities = [];
        //console.log(error);
      }
    );
  }

  /**this code is to get current weatherr and encode the date from unix, UTC
   * to Date() and set the icon url
  */
  onSubmit(){
    this.iconUrl = 'http://openweathermap.org/img/wn/';
    this.isLoadingWeather = true;
    this.weatherLoaded = false;
    this.error = false;
    const location = this.cityCtrl.value;
    this.location = location;
    //console.log(location);
    this.weatherService.getCurrentWeather(location).subscribe((weather) =>{
      //console.log(weather);
      this.currentWeather = weather;
      this.isLoadingWeather = false;
      this.weatherLoaded = true;
      this.currentDate = new Date(this.currentWeather.dt * 1000);
      //console.log(new Date(this.currentWeather.dt * 1000));
      this.iconUrl = this.iconUrl + this.currentWeather.weather[0].icon+'@2x.png';
      //console.log(this.iconUrl)
    },
      (error) =>{
      //console.log(error);
      this.error = true;
      this.errorMsg = error.error.message;
      this.isLoadingWeather = false;
      });
  }

  /**this code is to convert temperature from kelvin or farad to celsius
   * based on mathematical operations of conversion
   */
  convertTemptoC(x:number, y:string="k"):number | string{
    if(y === "f"){
       return ((x-32) * 5 / 9).toFixed(1);
    }
    else if(y === "k"){
      return (x-273.15).toFixed(1);
    }else{
      return x;
    }
  }
  /**this code is to convert wind direction to string to be easier to understand*/
  convertWindDirection(windDir: number):string{
  //we split the wind direction of 22,5 degrees (for each sector), to have indexes from 0 to 16
    return this.sectors[Math.round((windDir % 360)/ 22.5)+1];
  }
  /**this code is to convert Meter per second to Km per hour*/
  convertMpsoKmph(mps: number):number | string{
    return (3.6 * mps).toFixed(1);
  }

}
