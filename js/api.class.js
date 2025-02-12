class Company {
    constructor() {
        this.data = {};
        this.headers = {
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

    get(endpoint, params, callback, headers) {
        this.headers.method = "GET";
        this.call(endpoint, params, callback)
    }

    post(endpoint, params, callback, headers) {
        this.headers.method = "POST";
        this.call(endpoint, params, callback)
    }

    call(endpoint, params, callback, headers) {
        fetch(endpoint, params)
            .then(function (response) {
                if (response.ok) {
                    if(callback){
                        callback();
                    }
                    data=response.json();
                } else {
                    throw new Error("Could not reach the API: " + response.statusText);
                }
            }).then(function (d) {
                console.log(d.encoded);
            }).catch(function (error) {
                data= error.message;
            });
    }
}
