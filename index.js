// CREATED BY THE GREAT MR SMILE 
// CONTACT 254107065646 FOR MORE SCRIPTS 
//DO NOT BUY OR SELL THIS SCRIPT 
//DEVELOPER © mr smile tech
<!DOCTYPE html>
<html>
<head>
  <title>Phone Tracker</title>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <style>
    #map { height: 300px; width: 100%; margin-top: 10px; }
    footer {
      text-align: center; 
      padding: 10px; 
      margin-top: 20px; 
      border-top: 1px solid #ccc; 
      color: #555; 
      font-family: sans-serif;
    }
  </style>
</head>
<body>
  <h2>Register</h2>
  <input id="phone" placeholder="Phone" />
  <input id="email" placeholder="Email" />
  <input id="password" type="password" placeholder="Password" />
  <button onclick="register()">Register</button>

  <h2>Login</h2>
  <input id="loginPhone" placeholder="Phone" />
  <input id="loginPassword" type="password" placeholder="Password" />
  <button onclick="login()">Login</button>

  <h2>Share Location</h2>
  <button onclick="shareLocation()">Share My Location</button>

  <h2>Track Phone Number</h2>
  <input id="trackPhone" placeholder="Phone to track" />
  <button onclick="trackPhone()">Track</button>
  <div id="locationInfo"></div>
  <div id="map"></div>

<script>
  let token = null;
  let map, marker;

  function register() {
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    axios.post('http://localhost:4000/api/register', { phone, email, password })
      .then(res => alert(res.data.message))
      .catch(err => alert(err.response.data.error));
  }

  function login() {
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;

    axios.post('http://localhost:4000/api/login', { phone, password })
      .then(res => {
        token = res.data.token;
        alert('Logged in!');
      })
      .catch(err => alert(err.response.data.error));
  }

  function shareLocation() {
    if (!token) return alert('Please login first!');
    if (!navigator.geolocation) return alert('Geolocation not supported');

    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      axios.post('http://localhost:4000/api/location', { lat, lng }, {
        headers: { Authorization: 'Bearer ' + token }
      })
      .then(res => alert(res.data.message))
      .catch(err => alert(err.response.data.error));
    });
  }

  function initMap(lat, lng) {
    if (!map) {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat, lng }
      });
      marker = new google.maps.Marker({
        position: { lat, lng },
        map: map
      });
    } else {
      map.setCenter({ lat, lng });
      marker.setPosition({ lat, lng });
    }
  }

  function trackPhone() {
    const phone = document.getElementById('trackPhone').value;
    axios.get('http://localhost:4000/api/location/' + phone)
      .then(res => {
        const { lat, lng, timestamp } = res.data;
        document.getElementById('locationInfo').innerText = 
          `Last location: ${lat.toFixed(5)}, ${lng.toFixed(5)} at ${new Date(timestamp).toLocaleString()}`;
        initMap(lat, lng);
      })
      .catch(err => alert(err.response.data.error));
  }
</script>

<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY"></script>

<footer>
  © Mr Smile
</footer>

</body>
</html>

