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

const popUpOptions = {
  maxWidth: 250,
  minWidth: 100,
  autoClose: false,
  closeOnClick: false,
  className: 'running-popup',
};

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
    //Showing Marker on submitting form
    const { lat, lng } = this.#mapEventObj;
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
}

const app = new App();
