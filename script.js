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
const clearAllBtn = document.querySelector('.clear-all-btn');
const sort = document.querySelector('#sort');
const removeSort = document.querySelector('#remove-sort');

class Workouts {
  ID = Date.now();
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workouts {
  type = 'running';
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
  type = 'cycling';
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
  #workouts = JSON.parse(localStorage.getItem('workouts')) || [];
  #sorted = localStorage.getItem('sorted') || undefined;
  constructor() {
    this.#getPosition();
    inputType.addEventListener('change', () => this.#ToggleElv());
    form.addEventListener('submit', e => this.#newWorkout(e));
    containerWorkouts.addEventListener('click', e => {
      this.#moveToMarker(e);
      this.#clearWorkout(e);
    });
    this.#workouts && this.#getLocalStorage();
    clearAllBtn.addEventListener('click', () => this.#clearAll());
    sort.addEventListener('click', () => this.#sort());
    // removeSort.addEventListener('click', () => this.#removeSort());
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
    this.#workouts &&
      this.#workouts.forEach(workout => {
        this.#renderMarker(workout);
      });
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
    this.#renderMarker(Workout);
    this.#renderWorkout(Workout);
    this.#hideForm();
    this.#storeWorkout();
  }

  #renderMarker(Workout) {
    const timeOptions = { month: 'long', day: 'numeric' };
    const popUpOptions = {
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: `${Workout.type}-popup`,
    };

    //Showing Marker on submitting form
    L.marker(Workout.coords)
      .addTo(this.#map)
      .bindPopup(L.popup(popUpOptions))
      .setPopupContent(
        `${Workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
          Workout.type[0].toUpperCase() + Workout.type.slice(1)
        } on ${Intl.DateTimeFormat('en-GB', timeOptions).format(
          typeof Workout.date == 'string'
            ? new Date(Workout.date)
            : Workout.date
        )}`
      )
      .openPopup();
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  #renderWorkout(workout) {
    const timeOptions = { month: 'long', day: 'numeric' };
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.ID}">
        <h2 class="workout__title">${
          workout.type[0].toUpperCase() + workout.type.slice(1)
        } on ${Intl.DateTimeFormat('en-GB', timeOptions).format(
      typeof workout.date == 'string' ? new Date(workout.date) : workout.date
    )}</h2>
        <div class="workout__details">
            <span class="workout__icon">${
              workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'
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

    if (workout.type == 'running') {
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
            `;
    }
    if (workout.type == 'cycling') {
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
        
            `;
    }

    html += `
        <div></div>
        <div></div>
        <div></div>
        <div class="modifying-btn">
            <i class="fa-solid fa-pen-to-square fa-2x updating" style="color: #00c46a;" ></i>
            <i class="fa-solid fa-trash fa-2x deleting " id="deleting-${workout.ID}" style="color: #ff0000;"></i>
        </div>
    </li>`;

    form.insertAdjacentHTML('afterend', html);
  }

  #moveToMarker(e) {
    const modifying =
      e.target.classList.contains('updating') ||
      e.target.classList.contains('deleting');
    const targetedWorkout = e.target.closest('.workout');
    if (targetedWorkout && !modifying) {
      const workout = this.#workouts.find(
        workout => workout.ID == targetedWorkout.dataset.id
      );
      this.#map.setView([...workout.coords], 13, {
        animate: true,
        pan: {
          duration: 1,
        },
      });
    }
  }

  #storeWorkout() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  #getLocalStorage() {
    this.#workouts.forEach(workout => {
      this.#renderWorkout(workout);
    });
  }

  #clearAll() {
    localStorage.getItem('workouts') && location.reload();
    localStorage.removeItem('workouts');
  }

  #clearWorkout(e) {
    const deletingBtn = e.target;
    if (deletingBtn.classList.contains('deleting')) {
      const workoutId = deletingBtn.id.split('-')[1];
      this.#workouts = this.#workouts.filter(
        workout => workout.ID != workoutId
      );
      localStorage.removeItem('workouts');
      this.#workouts &&
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
      location.reload();
    }
  }

  #sort() {
    if (!this.#sorted || this.#sorted == 'descending') {
      localStorage.removeItem('sorted');
      localStorage.setItem('sorted', 'ascending');
      this.#workouts.sort((a, b) => b.distance - a.distance);
      localStorage.removeItem('workouts');
      localStorage.setItem('workouts', JSON.stringify(this.#workouts));
      location.reload();
    }
    if (this.#sorted == 'ascending') {
      localStorage.removeItem('sorted');
      localStorage.setItem('sorted', 'descending');
      this.#workouts.sort((a, b) => a.distance - b.distance);
      localStorage.removeItem('workouts');
      localStorage.setItem('workouts', JSON.stringify(this.#workouts));
      location.reload();
    }
  }

  // #removeSort() {
  //   if (this.#sorted) {
  //     localStorage.removeItem('sorted');
  //     localStorage.removeItem('workouts');
  //     const notsorted = JSON.parse(localStorage.getItem('notsorted'));
  //     localStorage.removeItem('notsorted');
  //     console.log(notsorted);
  //     localStorage.setItem('workouts', JSON.stringify(notsorted));
  //     location.reload();
  //   }
  // }
  //update
  //show all workouts on map
  //draw lines
  //weather
}

const app = new App();
