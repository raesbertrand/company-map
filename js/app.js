var endpointParam=env.defaultEndpointParams
var markers = L.markerClusterGroup();
var map = L.map("map").setView([47.450999, -0.555489], 16)
var collection = {}
const container = document.getElementById("json-container")

const selectedCompany = new Company();
document.addEventListener("companyDataUpdated", (event) => {
  container.textContent = ""
  createJsonViewer(event.detail, container)
  displayCompanyCard(event.detail)
})

const companyApi = new Api(env.endpoint, "datagouvEntreprises")
companyApi.get(endpointParam,null,true)

document.addEventListener("datagouvEntreprises", (event) => {
  let apiResult = event.detail
  feedMap(apiResult.results)
})

function feedMap(companies) {
  companies.forEach((company) => {
    if (company.date_fermeture == null) {
      company.matching_etablissements.forEach((etablissement) => {
        if (etablissement.date_fermeture == null && !collection[etablissement.siret]) {
          collection[etablissement.siret]=company;
          markers.addLayer(
            L.marker([etablissement.latitude, etablissement.longitude])
              .bindPopup(company.nom_complet)
              .on("click", function (e) {
                selectedCompany.update(company)
              })
          )
            .addTo(map)
        }
      })
    }
  })
}

function createJsonViewer(json, container) {
  function createElement(tag, className, text) {
    const el = document.createElement(tag)
    if (className) el.className = className
    if (text) el.textContent = text
    return el
  }

  function createTree(obj, parent) {
    const ul = createElement("ul", "json-tree")
    parent.appendChild(ul)

    Object.entries(obj).forEach(([key, value]) => {
      if (value === false || value === null) return // Ne pas afficher les valeurs false et null

      const li = createElement("li", "json-node")
      const keySpan = createElement("span", "json-key", key + ": ")
      li.appendChild(keySpan)

      if (typeof value === "object" && value !== null) {
        keySpan.classList.add("json-expandable")
        const subContainer = createElement("div", "json-subtree")
        li.appendChild(subContainer)
        keySpan.addEventListener("click", () => {
          subContainer.classList.toggle("hidden")
        })
        createTree(value, subContainer)
      } else {
        const valueSpan = createElement(
          "span",
          "json-value",
          JSON.stringify(value),
        )
        li.appendChild(valueSpan)
      }
      ul.appendChild(li)
    })
  }

  createTree(json, container)
}

function displayCompanyCard(comp){
  var target=document.querySelector("#company-card")
  target.textContent = ""
  var template = document.querySelector("#company-card-template");
  var clone = document.importNode(template.content, true);

  clone.querySelectorAll('.name')[0].textContent=comp.nom_complet

  target.appendChild(clone);
}


L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map)

map.on('zoomend, moveend', function(e) {
  var centre = map.getCenter();
  endpointParam.lat=centre.lat 
  endpointParam.long=centre.lng
  companyApi.get(endpointParam,null,true)
});
