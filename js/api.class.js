class Api {
    constructor(endPt, evt) {
        this.eventName = (evt) ? evt : "apiResponse";
        this.data = {};
        this.endpointUrl = endPt;
        this.parameters = null;
        this.page=1

        return new Proxy(this, {
            set(target, prop, value) {
                target.data[prop] = value;

                // Émettre un événement personnalisé avec les nouvelles données
                document.dispatchEvent(new CustomEvent(this.eventName, {
                    detail: target.data
                }));

                return true;
            }
        });
    }

    get(callback) {
        //TODO : add get var manager
        // this.endpointurl must be the url without url params
        this.parameters = null;
        this.call(callback)
    }

    post(params, callback) {
        let p = {
            headers: { "content-type": "application/json; charset=UTF-8" },
            body: {},
            method: "POST",
            mode: "cors"
        };
        this.parameters = Object.assign({}, p, params);

        this.call(callback)
    }

    call(callback) {
        this.page++;
        var obj = this;
        console.log(this.page)
        fetch(this.endpointUrl, this.parameters)
            .then(function (response) {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Could not reach the API: " + response.statusText);
                }
            })
            .then(function (d) {
                if (callback) {
                    callback();
                }
                
                Object.assign(obj.data, d)
                // Émettre un événement personnalisé après mise à jour complète
                document.dispatchEvent(new CustomEvent(obj.eventName, {
                    detail: obj.data
                }));

            })
            .catch(function (error) {
                Object.assign(obj.data, error.message)
            });
    }

    nextPage(){
        //TODO : manage pagination
    }
}
