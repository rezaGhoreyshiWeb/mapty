"use strict";

class Workouts {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = [
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
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workouts {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workouts {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
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
  #workouts = [];
  constructor() {
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

    this.containerWorkouts.addEventListener(
      "click",
      this._moveTheMapToPosition.bind(this)
    );

    // starters
    this._getPosition();
    this._readFromLocal();
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

    this._addMarkerToMap("🗺️ Your Current Location ", this.#coords);

    this.#map.on("click", this._mapClickHandler.bind(this));

    this.#workouts.forEach((workout) =>
      this._addMarkerToMap(
        workout.description,
        workout.coords,
        `workout--${workout.type}`
      )
    );
  }

  _addMarkerToMap(popupText, coords, popupClassName) {
    L.marker(coords)
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
    this.form.style.display = "none";
    this.form.classList.add("hidden");
    setTimeout(() => (this.form.style.display = "grid"));
  }

  _newWorkout(e) {
    e.preventDefault();

    const type = this.inputType.value;
    const distance = +this.inputDistance.value;
    const duration = +this.inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    this.#coords = [lat, lng];
    let workout;
    let popupText;
    let popupClassName = `${type}-popup`;

    if (type === "running") {
      const cadence = +this.inputCadence.value;
      const validInput = this._validateInputs(distance, duration, cadence);
      if (!validInput) {
        return alert("Inputs have to be positive Number");
      }

      workout = new Running(this.#coords, distance, duration, cadence);
      popupText = `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${
        workout.description
      }`;
    }

    if (type === "cycling") {
      const elevation = +this.inputElevation.value;
      const validInput = this._validateInputs(distance, duration, elevation);

      if (!validInput) {
        return alert("Inputs have to be positive Number");
      }
      workout = new Cycling(this.#coords, distance, duration, elevation);
      popupText = `🚴‍♀️ Cycling on April 14`;
    }

    this.#workouts.push(workout);

    this._addMarkerToMap(popupText, this.#coords, popupClassName);
    this._renderWorkout(workout);

    this._clearInputs();
    this._hideForm();

    this._storeWorkoutToLocal();
  }

  _renderWorkout(workout) {
    const html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${
              workout.type === "running"
                ? workout.pace.toFixed(1)
                : workout.speed.toFixed(1)
            }</span>
            <span class="workout__unit">${
              workout.type === "running" ? " min/km" : "km/h"
            }</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🦶🏼" : "⛰"
            }</span>
            <span class="workout__value">${
              workout.type === "running"
                ? workout.cadence
                : workout.elevationGain
            }</span>
            <span class="workout__unit">${
              workout.type === "running" ? "spm" : "m"
            }</span>
          </div>
     </li>
          `;

    this.form.insertAdjacentHTML("afterend", html);
  }

  _validateInputs(...inputs) {
    return inputs.every((inp) => Number.isFinite(inp) && inp > 0);
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

  _storeWorkoutToLocal() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _readFromLocal() {
    const workouts = localStorage.getItem("workouts");
    this.#workouts = workouts
      ? JSON.parse(localStorage.getItem("workouts"))
      : [];

    this.#workouts.forEach((workout) => this._renderWorkout(workout));
  }

  _moveTheMapToPosition(e) {
    const workoutEl = e.target.closest(".workout");
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, 10, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _resetAll() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
