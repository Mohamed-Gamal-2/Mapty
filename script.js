'use strict';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workouts {
  #ID = Date.now();
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workouts {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration * this.distance;
    return this.pace;
  }
}
class Cycling extends Workouts {
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEventObj;
  #workouts = [];
  constructor() {
    this.#getPosition();
    inputType.addEventListener('change', () => this.#ToggleElv());
    form.addEventListener('submit', e => this.#newWorkout(e));
  }

  #getPosition() {
    //using geolocation to fetch current coords
    navigator.geolocation.getCurrentPosition(
      location => this.#loadMap(location),
      () => {
        alert('Can not get your exact location');
      }
    );
  }

  #loadMap(location) {
    const { latitude, longitude } = location.coords;
    //Creating the map view
    this.#map = L.map('map').setView([latitude, longitude], 13);

    //Selecting tile to change map view
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#showCurrPosition(location);
    this.#showForm();
  }

  #showCurrPosition(location) {
    //Show Current Location marker
    const { latitude, longitude } = location.coords;
    L.marker([latitude, longitude])
      .addTo(this.#map)
      .bindPopup('Current Location.')
      .openPopup();
  }

  #showForm() {
    //Handling event when clicking on map to get coords of click + showing form
    this.#map.on('click', mapEvent => {
      this.#mapEventObj = mapEvent.latlng;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  }

  #hideForm() {
    form.style.display = 'none';
    setTimeout(() => (form.style.display = 'grid'), 1000);
    form.classList.add('hidden');
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    inputType.value = 'running';
  }

  #ToggleElv() {
    console.log(this);
    //Changing cadence with elevation
    if (inputType.value == 'running') {
      inputElevation.parentNode.classList.add('form__row--hidden');
      inputCadence.parentNode.classList.remove('form__row--hidden');
    } else {
      inputElevation.parentNode.classList.remove('form__row--hidden');
      inputCadence.parentNode.classList.add('form__row--hidden');
    }
  }

  #newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEventObj;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let Workout;
    if (type == 'running') {
      const cadence = +inputCadence.value;
      if (
        !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(cadence) ||
        distance < 0 ||
        duration < 0 ||
        cadence < 0
      )
        return alert('Input have to be positive numbers');
      Workout = new Running([lat, lng], distance, duration, cadence);
      this.#workouts.push(Workout);
    }
    if (type == 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(elevation) ||
        distance < 0 ||
        duration < 0
      )
        return alert('Input have to be positive numbers');

      Workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(Workout);
    }
    this.#renderMarker(lat, lng, type);
    this.#renderWorkout(Workout, type);
    this.#hideForm();
  }

  #renderMarker(lat, lng, type) {
    console.log(type);
    const popUpOptions = {
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: `${type}-popup`,
    };

    //Showing Marker on submitting form
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(L.popup(popUpOptions))
      .setPopupContent('Workout')
      .openPopup();
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  #renderWorkout(workout, type) {
    console.log(workout);
    const timeOptions = { month: 'long', day: 'numeric' };
    let html = `
    <li class="workout workout--${type}" data-id="${workout.ID}">
        <h2 class="workout__title">${
          type[0].toUpperCase() + type.slice(1)
        } on ${Intl.DateTimeFormat('en-GB', timeOptions).format(
      workout.date
    )}</h2>
        <div class="workout__details">
            <span class="workout__icon">${
              type == 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
        </div>
        `;

    if (type == 'running') {
      html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
          </div>
        </li>
            `;
    }
    if (type == 'cycling') {
      html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
            </div>
        </li>
            `;
    }

    form.insertAdjacentHTML('afterend', html);
  }
}

const app = new App();
