//console.log('hello from the client side')
const locations = JSON.parse(document.getElementById('map').dataset.locations)
//console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1IjoicmljazQyNyIsImEiOiJjang0cTlpYXkwMXRmNDVvNmJkMGw0YW5hIn0.ZBN7VLlJRJMFUrCgdn6h8w';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rick427/ck0aszn7v0yan1cse54vfirxv',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 4,
    // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    //create a marker
    const el = document.createElement('div');
    el.className = 'marker';

    // add the marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    //Add popup
    new mapboxgl.Popup({
        offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    }
});