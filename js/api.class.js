class Api {
    constructor() {
        this.data = {};
        this.endpointUrl=null;
        this.parameters = {
            headers: { "content-type": "application/json; charset=UTF-8" },
            body: {},
            method: "GET",
            mode: "cors"
        };

        return new Proxy(this, {
            set(target, prop, value) {
                target.data[prop] = value;

                // Émettre un événement personnalisé avec les nouvelles données
                document.dispatchEvent(new CustomEvent("apiResponse", {
                    detail: target.data
                }));

                return true;
            }
        });
    }

    get(endpt, params, callback) {
        let p = { ...this.parameters }
        Object.assign(this.parameters, p, params);
        this.parameters.method = "GET";

        this.endpointUrl=endpt;
        this.call(callback)
    }

    post(endpoint, params, callback) {
        let p = { ...this.parameters }
        this.parameters = Object.assign({}, p, params);

        this.parameters.method = "POST";
        this.endpointUrl=endpoint;
        this.call(callback)
    }

    call(callback) {
        console.log(this.endpointUrl)
        let obj=this;
        fetch(this.endpointUrl, this.parameters)
            .then(function (response) {
                if (response.ok) {
                    console.log(response)
                    if(callback){
                        callback();
                    }
                    Object.assign(obj.data, response.json())
                } else {
                    throw new Error("Could not reach the API: " + response.statusText);
                }
            }).then(function (d) {
                console.log(d.encoded);
            }).catch(function (error) {
                Object.assign(obj.data, error.message)
            });
    }
}
