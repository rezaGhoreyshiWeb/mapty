"use strict";

class Workouts {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workouts {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workouts {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
  }
}

////////////////////////////////////////////////////////////////////////////

class App {
  #map;
  #mapEvent;
  #coords;
  constructor() {
    this.months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // elements
    this.form = document.querySelector(".form");
    this.containerWorkouts = document.querySelector(".workouts");
    this.inputType = document.querySelector(".form__input--type");
    this.inputDistance = document.querySelector(".form__input--distance");
    this.inputDuration = document.querySelector(".form__input--duration");
    this.inputCadence = document.querySelector(".form__input--cadence");
    this.inputElevation = document.querySelector(".form__input--elevation");

    // events
    this.form.addEventListener("submit", this._newWorkout.bind(this));
    this.inputType.addEventListener(
      "change",
      this._toggleElevationField.bind(this)
    );

    // starters
    this._getPosition();
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        this._loadMap.bind(this)
      );
    }
  }

  _loadMap(position) {
    const latitude = position?.coords?.latitude;
    const longitude = position?.coords?.longitude;
    this.#coords = [latitude || 35.68, longitude || 51.36]; //for showing the default latitude and longitude
    this.#map = L.map("map").setView(this.#coords, latitude ? 13 : 5);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this._addMarkerToMap(
      position
        ? "🗺️ Your Current Location "
        : "🗺️ Your Current Location Not Available<br> Fine it Manually"
    );

    this.#map.on("click", this._mapClickHandler.bind(this));
  }

  _addMarkerToMap(popupText, popupClassName) {
    L.marker(this.#coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: popupClassName || "",
        }).setContent(popupText)
      )
      .openPopup();
  }

  _mapClickHandler(mapE) {
    this.#mapEvent = mapE;
    this._showForm();
  }

  _showForm() {
    this.form.classList.remove("hidden");
    this.inputDistance.focus();
  }

  _hideForm() {
    this.form.classList.add("hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    this._clearInputs();
    this._hideForm();
  }

  _clearInputs() {
    this.inputDistance.value =
      this.inputDuration.value =
      this.inputCadence.value =
      this.inputElevation.value =
        "";
  }

  _toggleElevationField() {
    this.inputElevation
      .closest(".form__row")
      .classList.toggle("form__row--hidden");
    this.inputCadence
      .closest(".form__row")
      .classList.toggle("form__row--hidden");
  }
}

const app = new App();
