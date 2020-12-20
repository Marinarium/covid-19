function addMap() {
  const layout = window.L;
  const map = layout.map('map').setView([53.2000, 25.8000], 7);
  const circleIcon = layout.icon({
    iconUrl: 'img/marker-icon.svg',
    iconSize: []
  });

  layout.mapboxGL({
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
    accessToken: 'not-needed',
    style: 'https://api.maptiler.com/maps/1e257f70-99a4-4d27-bef3-620500ae11e6/style.json?key=uji77qyPm7V3FmJfV7Xk'
  }).addTo(map);

  layout.marker([53.9229, 27.47667], {icon: circleIcon})
    .addTo(map);
}

export default {addMap};