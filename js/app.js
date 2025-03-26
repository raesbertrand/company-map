const tools = new Tools()

const companyApi = new Api(env.endpoint, "datagouvEntreprises")
const selectedCompany = new Company();
const container = document.getElementById("json-container")

var endpointParam = env.defaultEndpointParams
var collection = new GeoJsonGenerator()
var pointsCollection = collection.getCollection()
var markers = L.markerClusterGroup();
var map = L.map("map").setView([47.450999, -0.555489], 16)
var DateTime = luxon.DateTime

let filtersForm = document.querySelector('#filters form');


var filters = {
  "est_association": false,
  "est_bio": false,
  "est_entrepreneur_spectacle": false,
  "est_ess": false,
  "est_finess": false,
  "est_organisme_formation": false,
  "est_qualiopi": false,
  "est_rge": false,
  "est_service_public": false,
  "est_societe_mission": false,
  "est_uai": false,
  "statut_bio": false
}

injectFilters()


var geoJsonLayer = L.geoJSON(pointsCollection,
  {
    onEachFeature: onEachFeature,
    filter: tools.geoJsonfilter
  }
)

companyApi.get(endpointParam, null, true)

filtersForm.addEventListener('change', function (event) {
  let field = event.target;
  filters[field.name] = field.checked
  geoJsonLayer.clearLayers();
  markers.clearLayers();

  let geo = collection.getCollection()
  geo["features"].forEach(feature => {
    addPoint(feature)
  })
});

document.addEventListener("companyDataUpdated", (event) => {
  container.textContent = ""
  tools.createJsonViewer(event.detail, container)

  let companyNotes = new Api(env.companyApi + env.noteEndpoint + '/siret?', "getCompanyNotes")

  companyNotes.get({ 'number': event.detail.siret }, function (data) {
    event.detail.company.notes = data
    displayCompanyCard(event.detail)

    document
      .querySelector(".open-modal")
      .addEventListener("click", function (e) {
        modal.open(e.srcElement.getAttribute('data-modal'));
      });

    document
      .querySelector(".close")
      .addEventListener("click", function (e) {
        closeCompanyCard()
      });

    var formNote = document.querySelector("#send-note")
    formNote.addEventListener("submit", function (e) {
      e.preventDefault()
      postNote(formNote, event.detail.siret)
    });
  })
})

document
  .querySelector("[data-display]")
  .addEventListener("click", function (e) {
    e.preventDefault()
    let element = document.querySelector(this.getAttribute('data-display'))
    element.style.display = tools.isVisible(element) ? 'none' : 'block'
  });


document.addEventListener("datagouvEntreprises", (event) => {
  let apiResult = event.detail
  loadbar(apiResult.page, apiResult.total_pages)
  feedMap(apiResult.results)
})

function loadbar(progress, total) {
  let percent = (progress * 100) / total
  let displayPercent = document.querySelectorAll(".percent")
  let progressBar = document.querySelector("progress")

  if (displayPercent.length > 0) {
    displayPercent.forEach(function (v, k) {
      v.textContent = Math.round(percent) + "%"
    })
  }

  if (progressBar) {
    progressBar.setAttribute("value", percent)
  }
}

function countVisibleMarkers(map, clusterGroup) {
  var count = clusterGroup.getLayers().filter(marker =>
    map.getBounds().contains(marker.getLatLng())
  ).length;
  return count;
}

function postNote(formNote, siret) {
  let sendNote = new Api(env.companyApi + env.noteEndpoint + '/insert', "newNoteSent")
  let formData = new FormData(formNote);

  let data = Object.fromEntries(formData.entries()); // Convert FormData entries to an object
  data.siret = siret

  sendNote.post({ body: JSON.stringify(data) })
}

function feedMap(companies) {
  companies.forEach((company) => {
    if (company.date_fermeture == null && company.complements.est_entrepreneur_individuel!=true) {
      company.matching_etablissements.forEach((etablissement) => {
        if (etablissement.date_fermeture == null
          && !collection.searchId(etablissement.siret)
        ) {
          let converter = new GeoJsonConverter()
          let feature = converter.convertItem([Number(etablissement.longitude), Number(etablissement.latitude)], company, company.nom_complet, etablissement.siret)

          collection.addFeature(feature)
          addPoint(feature)

          let count = document.querySelectorAll('.total_markers')
          if (count.length > 0) {
            count.forEach(function (v, k) {
              v.textContent = collection.featureCollection.features.length
            })
          }
        }
      })
    }

    let displayed = countVisibleMarkers(map, markers)
    let markerCount = document.querySelectorAll('.visible_markers')
    if (markerCount.length > 0) {
      markerCount.forEach(function (v, k) {
        v.textContent = displayed
      })
    }
  })
}

function addPoint(feature) {
  geoJsonLayer.addData(feature)

  markers.addLayer(geoJsonLayer)
    .addTo(map)
}

function onEachFeature(feature, layer) {
  layer.bindPopup(feature.properties.nom_complet)
    .on("click", function (e) {
      selectedCompany.update({ "siret": feature.id, "company": feature.properties })
    })
}


function injectFilters() {
  var template = document.querySelector("#bool-filter");
  var target = document.querySelector("#filters form");
  for (let key in filters) {
    let clone = document.importNode(template.content, true);

    let value = filters[key]
    let label = tools.capitalizeFirstLetter(key.replaceAll('est_', '').replaceAll('_', ' '))

    let labelNode = clone.querySelector('label')
    labelNode.setAttribute("for", key)
    labelNode.textContent = label

    let checkboxNode = clone.querySelector('input')
    checkboxNode.setAttribute("name", key)
    checkboxNode.setAttribute("id", key)
    checkboxNode.checked = value

    target.appendChild(clone);
  }
}

function displayCompanyCard(markerDatas) {
  var target = document.querySelector("#company-card")
  var siret = markerDatas['siret'];
  var companyDetails = markerDatas['company']
  target.textContent = ""
  var template = document.querySelector("#company-card-template");
  var clone = document.importNode(template.content, true);
  tools.insertVarTemplate(["siret", siret], companyDetails, clone)
  target.appendChild(clone);
}


function closeCompanyCard() {
  var target = document.querySelector("#company-card").textContent = ""
}

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map)

map.on('zoomend, moveend', function (e) {
  var centre = map.getCenter();
  endpointParam.lat = centre.lat
  endpointParam.long = centre.lng
  companyApi.get(endpointParam, null, true)
});

modal.init();
