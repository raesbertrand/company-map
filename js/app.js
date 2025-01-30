var response = await fetch('https://recherche-entreprises.api.gouv.fr/near_point?lat=47.450999&long=-0.555489&radius=1&per_page=25');
var data = await response.json();
var map = L.map('map').setView([47.468, -0.558], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

data.results.forEach((company) => {
    L.marker([51.5, -0.09]).addTo(map)
        .bindPopup(company.nom_complet);
})
