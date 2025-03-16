class Api {
    constructor(endPt, evt) {
        this.eventName = (evt) ? evt : "apiResponse";
        this.endpointUrl = endPt;
        this.data = {};
        this.page = 1

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

    get(vars, callback, all) {
        let urlVars=vars;
        if(typeof(vars)!="string"){
            urlVars=this.objToParams(vars)
        }
        this.call(this.endpointUrl += urlVars, null, callback, all)
    }

    post(params, callback) {
        let p = {
            headers: { "content-type": "application/json; charset=UTF-8" },
            body: {},
            method: "POST",
            mode: "cors"
        };
        let parameters = Object.assign({}, p, params);
        
        this.call(this.endpointUrl, parameters, callback)
    }

    call(uri, params, callback, all) {
        this.page++;
        var obj = this;
        var urlCache

        fetch(uri, params)
            .then(function (response) {
                if (response.ok) {
                    urlCache = response.url;
                    return response.json();
                } else {
                    throw new Error("Could not reach the API: " + response.statusText);
                }
            })
            .then(function (d) {
                if (callback) {
                    callback(d);
                }
                
                Object.assign(obj.data, d)

                // Émettre un événement personnalisé après mise à jour complète
                document.dispatchEvent(new CustomEvent(obj.eventName, {
                    detail: obj.data
                }));

                if (all && d.page < d.total_pages) {
                    let urlparams=urlCache.split('?')
                    let p = new URLSearchParams(urlparams[1]);
                    p.set("page",d.page+=1)

                    obj.get(p.toString(), callback,all)
                }

            })
            .catch(function (error) {
                Object.assign(obj.data, error.message)
            });
    }

    objToParams(object) {
        var out = [];

        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                out.push(key + '=' + encodeURIComponent(object[key]));
            }
        }

        return out.join('&');
    }
}
