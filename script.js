"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// variables
let longitude, latitude;
let map;

// getting the location of the user
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    successCallGeolocation,
    errorCallGeolocation
  );
}

// function will be called when the geolocation is available
function successCallGeolocation(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  const coords = [latitude, longitude];
  map = L.map("map").setView(coords, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker(coords)
    .addTo(map)
    .bindPopup(" 🗺️ Your Current Location ")
    .openPopup();
}
// function will be called when the geolocation is not available
function errorCallGeolocation() {
  const coords = [35.68, 51.36];
  map = L.map("map").setView(coords, 10);

  L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker(coords)
    .addTo(map)
    .bindPopup(" 🗺️ Your Current Location Not Available<br> Fine it Manually.")
    .openPopup();
}
