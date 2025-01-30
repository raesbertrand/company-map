const api='https://recherche-entreprises.api.gouv.fr/near_point?lat=47.450999&long=-0.555489&radius=1&per_page=25';
var map = L.map('map').setView([47.468, -0.558], 13);

async function loadApi () {
	await fetch(api).then(function (response) {
		return response.json();
	}).then(function (data) {
    data.results.forEach((company) => {
    company.matching_etablissements.forEach((etablissement)=>{
        L.marker([etablissement.latitude, etablissement.longitude]).addTo(map)
            .bindPopup(company.nom_complet);
    });
	});
});
}
loadApi();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
