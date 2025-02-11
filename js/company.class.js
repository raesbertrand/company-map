class Company {
    constructor() {
        this.data = {};
        return new Proxy(this, {
            set(target, prop, value) {
                console.log(`Mise à jour de ${prop}:`, value);
                target.data[prop] = value;
                return true;
            }
        });
    }
  
    update(nouvellesDonnees) {
        Object.assign(this.data, nouvellesDonnees);
        container.textContent = ""
        createJsonViewer(this.data, container)
        // console.log("Mise à jour complète des données", this.data);
    }
  }