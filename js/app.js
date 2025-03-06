
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
  "est_entrepreneur_individuel": false,
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
    filter: geoJsonfilter
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
  createJsonViewer(event.detail, container)
  displayCompanyCard(event.detail)
})

document.addEventListener("datagouvEntreprises", (event) => {
  let apiResult = event.detail
  feedMap(apiResult.results)
})

function feedMap(companies) {
  companies.forEach((company) => {
    if (company.date_fermeture == null) {
      company.matching_etablissements.forEach((etablissement) => {
        if (etablissement.date_fermeture == null
          && !collection.searchId(etablissement.siret)
        ) {
          let converter = new GeoJsonConverter()
          let feature = converter.convertItem([Number(etablissement.longitude), Number(etablissement.latitude)], company, company.nom_complet, etablissement.siret)

          collection.addFeature(feature)
          addPoint(feature)
        }
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
    let label = capitalizeFirstLetter(key.replaceAll('est_', '').replaceAll('_', ' '))

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


function geoJsonfilter(feature) {
  var datas = feature.properties
  var noFilter = true

  for (let key in filters) {
    if (filters[key] !== false) {
      noFilter = false
      break
    }
  }

  if (noFilter == true) {
    return true
  }

  for (let key in filters) {
    if (filters[key] == true) {
      var search = searchJSON(datas, key, filters[key])
      if (search.length > 0) {
        return true
      }

    }
  }

  return false
}

function searchJSON(obj, key, val) {
  let results = [];
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      if (k === key && obj[k] === val) {
        results.push(obj);
      } else if (typeof obj[k] === "object") {
        results = results.concat(searchJSON(obj[k], key, val));
      }
    }
  }
  return results;
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
      // if (value === false || value === null) return // Ne pas afficher les valeurs false et null

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

function displayCompanyCard(markerDatas) {
  var target = document.querySelector("#company-card")
  var siret = markerDatas['siret'];
  var companyDetails = markerDatas['company']
  target.textContent = ""
  var template = document.querySelector("#company-card-template");
  var clone = document.importNode(template.content, true);
  insertVarTemplate(["siret", siret], companyDetails, clone)

  target.appendChild(clone);
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function insertVarTemplate(unicId, datas, model, parent, specific) {
  // unicId must be an array. Index 0 define the key of an object, index 1 define a value. If a node contains this key with a different value, the node is ignore. 
  // The goal is to ignore unrelevant buildings of the company as the user click on a single building but the data list all of them.
  Object.entries(datas).forEach((data) => {
    let key = ''
    if (!parent) {
      key = data[0]
    }
    else {
      key = parent + "-" + data[0]
    }

    let value = data[1];

    if (data[unicId[0]] && data[0] != unicId[0] && data[unicId[0]] != unicId[1]) {
      // Do not parse object if the collection is locked with a specific index
      return
    }

    if (typeof (value) == "object" && value != null) {
      //process subobject
      let collec
      let type
      if (value[0]) {
        collec = value
        type = 'array'
      }
      else {
        collec = Object.entries(value)
        type = 'json'
      }

      let loop = model.querySelectorAll('.loop_' + key);
      let looper = loop.length > 0 && loop[0].hasAttribute('data-template')
      
      if (looper) {
        loop[0].textContent = ""
      }
      collec.forEach(function (d, i) {
        if (looper) {
          let disp = null
          if (type == 'array') {
            disp = d
          }
          else if (d[1]) {
            disp = {}
            disp[d[0]] = d[1]
          }

          if (disp) {
            let tpl = document.querySelector("#" + loop[0].getAttribute('data-template'));
            let submodel = document.importNode(tpl.content, true);

            insertVarTemplate(unicId, disp, submodel, key)
            loop[0].appendChild(submodel);
          }
        }
        else {
          insertVarTemplate(unicId, d, model, key)
        }
      })
    }
    else {
      //insert data
      let label = capitalizeFirstLetter(data[0].replaceAll('_', ' '))
      let node
      let labelNode
      
      let stdModel=model.querySelectorAll('.standard')
      if (stdModel.length > 0) {
        node = model.querySelectorAll('.standard .value')
        labelNode = model.querySelectorAll('.standard .label')
        
        stdModel[0].classList.remove('standard')
      }
      else {
        node = model.querySelectorAll('.' + key)
        labelNode = model.querySelectorAll('.' + key + '--label')
      }

      if (node.length > 0) {
        node.forEach(function (v, k) {
          v.textContent = displayValue(value)
        })
      }

      if (labelNode.length > 0) {
        labelNode.forEach(function (v, k) {
          v.textContent = label
        })
      }

    }
  });
}


function displayValue(data) {
  var output;
  if (data === null) {
    return data
  }

  switch (data) {
    case 'true':
    case true:
      output = "oui";
      break;
    case 'false':
    case false:
      output = "non";
      break;
    default:
      output = data
  }
  if (output != data) {
    return output
  }

  let testNumber = Number(data)
  if (typeof testNumber == 'number' && !isNaN(testNumber)) {
    output = testNumber
    return output;
  }

  let testDate = DateTime.fromISO(data);
  if (!testDate.invalid) {
    output = testDate.toLocaleString(DateTime.DATE_FULL);
    return output
  }
  return output;
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
document
  .querySelector(".open_modal")
  .addEventListener("click", function (e) {
    modal.open(e.srcElement.getAttribute('data-modal'));
  });