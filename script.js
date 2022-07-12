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

// getting the location of the user
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    successErrorCallGeolocation,
    successErrorCallGeolocation
  );
}

// function will be called when success or error is triggered
function successErrorCallGeolocation(position) {
  const latitude = position?.coords?.latitude; 
  const longitude = position?.coords?.longitude;
  const coords = [latitude || 35.68, longitude || 51.36]; //for showing the default latitude and longitude
  console.log(coords);
  const map = L.map("map").setView(coords, latitude ? 13 : 5);

  L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker(coords)
    .addTo(map)
    .bindPopup(
      `  ${
        position
          ? "🗺️ Your Current Location "
          : "🗺️ Your Current Location Not Available<br> Fine it Manually"
      } `
    )
    .openPopup();
}
