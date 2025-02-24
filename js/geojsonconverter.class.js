class GeoJsonConverter {
    constructor(datas) {
        this.collection = datas
        return true
    }

    getNode(attribute, value) {
        let output

        this.collection.forEach(function (item) {
            if (item[attribute] == value) {
                output = item

            }
        })

        return output
    }

    convertCollectionFromDatagouv(collectionArray) {
        output = new GeoJsonGenerator()
        collectionArray.forEach(function (e) {
            let point = this.convertItem([e.office.lat, e.office.long], e.company, e.office.nom, e.office.siret);
            output.addFeature(point)
        });
        return output;
    }

    convertItem(coordinates, properties, name, id) {
        let marker = {}
        let output = {}
        marker.properties = properties
        marker.properties.shape = "Marker"
        marker.properties.name = name
        marker.id = id
        marker.geometry = { "type": "Point" }
        marker.geometry.coordinates = coordinates

        let point = new GeoJsonGenerator()
        output = point.initModelFeature(marker)

        // output=point
        return output
    }
}

class GeoJsonGenerator {
    constructor() {
        this.featureCollection = {
            "type": "FeatureCollection",
            "features": []
        }

        this.modelFeature = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [-74.003949, 40.722998]
            },
            "id": ""
        }
        return true
    }



    getCollection() {
        return this.featureCollection
    }

    addFeature(feature) {
        this.featureCollection.features.push(feature)
        return this.featureCollection
    }

    getFeatureCollection() {
        return this.featureCollection
    }

    initModelFeature(data) {
        return Object.assign({}, this.modelFeature, data);
    }

    searchId(id) {
        // if (geojson.type === 'FeatureCollection') {
            console.log(JSON.stringify(this.featureCollection.features))

            for (let i = 0; i < this.featureCollection.features.length; i++) {
                console.log(this.featureCollection.features[i].id, id)
                if (this.featureCollection.features[i].id === id) {
                    return this.featureCollection.features[i];
                }
            }
        // } else if (geojson.type === 'Feature') {
        //     if (geojson.id === id) {
        //         return geojson;
        //     }
        // }
        return null;
    }

    testDuplicateId(id){
        let output=[]
        for (let i = 0; i < this.featureCollection.features.length; i++) {
            if (this.featureCollection.features[i].id === id) {
                output.push(this.featureCollection.features[i]);
            }
        }
        return output
    }
}