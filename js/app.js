const api='https://recherche-entreprises.api.gouv.fr/near_point?lat=47.450999&long=-0.555489&radius=0.5&per_page=25';
var map = L.map('map').setView([47.468, -0.558], 13);
var page=1;
var maxPage=1000;

async function loadApi (url) {
	await fetch(url).then(function (response) {
		return response.json();
	}).then(function (data) {
  	page++;
    maxPage=data.total_pages;
    if(page<=maxPage){
    	loadApi (api+'&page='+page);
    }
    feedMap(data.results);
});
}

function feedMap(companies){ 
	companies.forEach((company) => {
    if(company.date_fermeture==null){
        company.matching_etablissements.forEach((etablissement)=>{
          if(etablissement.date_fermeture==null){
              L.marker([etablissement.latitude, etablissement.longitude]).addTo(map)
                  .bindPopup(company.nom_complet);
            }
        });  
      }
	});
}

loadApi(api+'&page='+page);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
