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
let map;

let mapEventObj;
//using geolocation to fetch current coords
navigator.geolocation.getCurrentPosition(
  location => {
    const { latitude, longitude } = location.coords;
    //Creating the map view
    map = L.map('map').setView([latitude, longitude], 13);

    //Selecting tile to change map view
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    //Show Current Location marker
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup('Current Location.')
      .openPopup();

    //Handling event when clicking on map to get coords of click + showing form
    map.on('click', mapEvent => {
      mapEventObj = mapEvent.latlng;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  },
  () => {
    alert('Can not get your exact location');
  }
);

//Showing Marker on submitting form
form.addEventListener('submit', e => {
  e.preventDefault();
  const { lat, lng } = mapEventObj;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(L.popup(popUpOptions))
    .setPopupContent('Workout')
    .openPopup();
  inputDistance.value =
    inputCadence.value =
    inputDuration.value =
    inputElevation.value =
      '';
});

//Changing cadence with elevation
inputType.addEventListener('change', () => {
  if (inputType.value == 'running') {
    inputElevation.parentNode.classList.add('form__row--hidden');
    inputCadence.parentNode.classList.remove('form__row--hidden');
  } else {
    inputElevation.parentNode.classList.remove('form__row--hidden');
    inputCadence.parentNode.classList.add('form__row--hidden');
  }
});
