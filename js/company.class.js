class Company {
    constructor() {
        this.data = {};

        return new Proxy(this, {
            set(target, prop, value) {
                target.data[prop] = value;

                // Émettre un événement personnalisé avec les nouvelles données
                document.dispatchEvent(new CustomEvent("companyDataUpdated", {
                    detail: target.data
                }));

                return true;
            }
        });
    }

    update(newDatas) {
        Object.assign(this.data, newDatas);

        // Émettre un événement personnalisé après mise à jour complète
        document.dispatchEvent(new CustomEvent("companyDataUpdated", {
            detail: this.data
        }));
    }
}
