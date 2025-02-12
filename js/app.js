const endpoint =
  "https://recherche-entreprises.api.gouv.fr/near_point?lat=47.450999&long=-0.555489&radius=0.5&per_page=25"
var markers = L.markerClusterGroup();
var map = L.map("map").setView([47.468, -0.558], 13)
var page = 1
var maxPage = 1000
var collection = []
const container = document.getElementById("json-container")

const selectedCompany = new Company();
const companyApi= new Api();
companyApi.get(endpoint,{"test":"ok"},null)

document.addEventListener("companyDataUpdated", (event) => {
  container.textContent = "";
  createJsonViewer(event.detail, container);
});

// async function loadApi(url) {
//   await fetch(url)
//     .then(function (response) {
//       return response.json()
//     })
//     .then(function (data) {
//       page++
//       maxPage = data.total_pages
//       if (page <= maxPage) {
//         loadApi(api + "&page=" + page)
//       }
//       feedMap(data.results)
//     })
// }

function feedMap(companies) {
  companies.forEach((company) => {
    if (company.date_fermeture == null) {
      collection.push(company)
      company.matching_etablissements.forEach((etablissement) => {
        if (etablissement.date_fermeture == null) {
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


// loadApi(api + "&page=" + page)


L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map)
