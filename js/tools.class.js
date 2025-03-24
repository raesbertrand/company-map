class Tools {


    isVisible(element) {
        if (!element) return false;
        const style = getComputedStyle(element);
        if (style.display === 'none') return false;
        if (style.visibility !== 'visible') return false;
        if (style.opacity < 0.1) return false;
        const boundingRect = element.getBoundingClientRect();
        if (boundingRect.width <= 0 || boundingRect.height <= 0) return false;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        if (boundingRect.top > viewportHeight || boundingRect.left > viewportWidth) return false;
        return true;
    }

    geoJsonfilter(feature) {
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

    searchJSON(obj, key, val) {
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


    createJsonViewer(json, container) {
        this.createTree(json, container)
    }

    createElement(tag, className, text) {
        const el = document.createElement(tag)
        if (className) el.className = className
        if (text) el.textContent = text
        return el
    }

    createTree(obj, parent) {
        let cl=this
        const ul = cl.createElement("ul", "json-tree")
        parent.appendChild(ul)

        Object.entries(obj).forEach(([key, value]) => {
            // if (value === false || value === null) return // Ne pas afficher les valeurs false et null

            const li = cl.createElement("li", "json-node")
            const keySpan = cl.createElement("span", "json-key", key + ": ")
            li.appendChild(keySpan)

            if (typeof value === "object" && value !== null) {
                keySpan.classList.add("json-expandable")
                const subContainer = cl.createElement("div", "json-subtree")
                li.appendChild(subContainer)
                keySpan.addEventListener("click", () => {
                    subContainer.classList.toggle("hidden")
                })
                cl.createTree(value, subContainer)
            } else {
                const valueSpan = cl.createElement(
                    "span",
                    "json-value",
                    JSON.stringify(value),
                )
                li.appendChild(valueSpan)
            }
            ul.appendChild(li)
        })
    }

    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    insertVarTemplate(unicId, datas, model, parent, specific) {
        let cl=this
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

                            cl.insertVarTemplate(unicId, disp, submodel, key)
                            loop[0].appendChild(submodel);
                        }
                    }
                    else {
                        cl.insertVarTemplate(unicId, d, model, key)
                    }
                })
            }
            else {
                //insert data
                let label = cl.capitalizeFirstLetter(data[0].replaceAll('_', ' '))
                let node
                let labelNode

                let stdModel = model.querySelectorAll('.standard')
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
                        v.textContent = cl.displayValue(value, v)
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

    displayValue(data, node = null) {
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
        if (testDate.isValid) {
            let format = 'DATE_FULL'
            if (node && node.getAttribute('data-dateformat')) {
                format = node.getAttribute('data-dateformat')
            }
            output = testDate.toLocaleString(DateTime[format]);
            return output
        }
        return output;
    }
}