const isOdd = (number) => number % 2;

Vue.use(bootstrapVue);

const vm = new Vue({
    el: '#app',
    mixins: [mixin.mixin()],
    data:
    {
        user: new User(),
        form: {
            dataInizio: new Date(),
            dataFine: new Date(),
        },
        items: [],
        prenotazioneAggiuntiva: {
            food: 'mezzo panuozzo nutella',
            username: 'Cosimo'
        },
        spesaUtente: {
            username: 'Cosimo'
        },
        foods: window.foodGlobal,
        orarioPrenotazione: "20:00",
        riassuntoOrdineVisibile: false,
        modalEditPrenotazione: {},
        fieldException: ['_id', 'prenotazioneId', 'email', 'date', '__v']
    },
    mounted() {
        if (!this.user.logged || !this.user.is(window.User.Type.Admin)) {
            window.location.href = "/";
        }
        this.fetchData();
    },
    methods: {
        getUserRoles() {
            if (!this.user.roles.length) return 'user';
            return this.user.roles.join(',');
        },
        fetchData() {

            const [dataInizio, dataFine] = window.generateStartEnd(this.form.dataInizio, this.form.dataFine);

            Api('data').post('find', {
                query: { date: { $gte: dataInizio, $lt: dataFine } },
                table: "prenotazioneCibo"
            }).then((response) => {
                if (response.data.length) {
                    response.data[0].action = {};
                }
                this.items = response.data
            });

        },
        openPrenotazione() {
            window.open(this.linkPrenotazione, '_blank');
        },
        salvaPrenotazione() {
            const utente = this.commensaliList.find(utente => utente.username === this.prenotazioneAggiuntiva.username);

            Api('data').post('create', {
                data: {
                    food: this.prenotazioneAggiuntiva.food,
                    username: utente.username,
                    email: utente.email,
                    text: 'generato da pagina admin',
                    date: new Date()
                },
                table: "prenotazioneCibo"
            }).then(() => {
                this.fetchData();
                this.$refs.modalprenotazioneaggiuntiva.hide()
            });

        },
        aggiornaPrenotazione() {
            const utente = this.commensaliList.find(utente => utente.username === this.modalEditPrenotazione.username);

            Api('data').post('findOneAndUpdate', {
                table: "prenotazioneCibo",
                update: {
                    username: utente.username,
                    email: utente.email,
                    text: this.modalEditPrenotazione.text,
                    food: this.modalEditPrenotazione.food,
                },
                filter: {
                    '_id': this.modalEditPrenotazione._id
                }
            }).then(() => {
                this.fetchData();
                this.$refs.modalEditPrenotazione.hide()
            });
        },
        eliminaPrenotazione() {
            Api('data').post('findOneAndDelete', {
                table: "prenotazioneCibo",
                filter: { '_id': this.modalEditPrenotazione._id }
            }).then(() => {
                this.fetchData();
                this.$refs.modalEditPrenotazione.hide()
            });
        },
        openEditModal(item) {

            if (!this.user.is(window.User.Type.Casta)) return;

            this.modalEditPrenotazione = item;

            this.$refs.modalEditPrenotazione.show();
        },
        sendNotification() {
            Api('data').post('find', {
                "query": { token: { $exists: true } },
                "table": "firebaseUser"
            }
            ).then((response) => {
                const tokens = response.data;
                for (const token of tokens) {
                    window.axios.post('https://fcm.googleapis.com/fcm/send', {
                        "to": token.token,
                        "notification": {
                            "title": "Prenotazione per stasera",
                            "body": "This is an FCM Message",
                            "icon": "./img/icons/android-chrome-192x192.png",
                            click_action: '/home?prenotazione=' + new Date().getTime()
                        },

                    }, {
                            headers: {
                                "Authorization": "key=AAAA7O6ZJeU:APA91bHQtkO0QhSOCcYihran4ArnRH3tRJovtDeke_bF2PDbU5rCHXXME9LPYFS284f2PSeRhpSmW9gHOQajRZ5Ull2hkBycQ87diD2gs-2mO-urCgwy2E0Y25sFRIKt3RpBPiuAtLUp",
                                "Content-Type": "application/json"
                            },

                        }).then(response => {
                            this.$bvToast.toast(`Notification sent!`, {
                                title: 'Notification sent!',
                                autoHideDelay: 5000,
                                appendToast: true
                            })
                        })


                }

            });
        }
    },
    computed: {
        commensaliList() {
            let commensali = [];

            this.items.forEach(item => {
                const food = this.foods.find(cibo => cibo.name === item.food);
                commensali.push({ ...item, ...food });
            });

            const pani = commensali.filter(c => c.food === 'mezzo panuozzo');

            if (isOdd(pani.length)) {
                const panoIndex = commensali.findIndex(c => c._id === pani[pani.length - 1]._id);
                commensali[panoIndex] = { ...commensali[panoIndex], price: 5, only: true };
            }

            return commensali;
        },
        ordine() {
            let ordine = [];
            let commensali = this.commensaliList || [];

            commensali = commensali.filter(item => item.type === 0);

            const cibiDaOrdinare = [...new Set(commensali.map(cibo => cibo.name))];

            cibiDaOrdinare.forEach(cibo => {
                if (cibo !== 'mezzo panuozzo') {
                    ordine.push({
                        name: cibo, quantity: commensali.filter(i => i.food === cibo).length
                    });
                }
            });

            const mezzoPanuozzoQuantity = parseInt(commensali.filter(c => c.food === 'mezzo panuozzo').length);

            if (isOdd(mezzoPanuozzoQuantity)) {
                ordine.push({ name: 'mezzo panuozzo', quantity: 1 })
            }

            if (mezzoPanuozzoQuantity > 1) {
                ordine.push({ name: 'panuozzo 8 pezzi', quantity: parseInt(mezzoPanuozzoQuantity / 2) });
            }

            ordine = ordine.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });

            return ordine;
        },
        linkPrenotazione() {
            const today = new Date();

            const date = `${window.dateFns.format(today, "MM/DD/YYYY")} ${this.orarioPrenotazione}`;

            const dateCrypted = btoa(new Date(date).getTime());

            const urlPrenotazione = `${origin}//prenotazione?${dateCrypted}`;

            const phone = '393385901152';

            return `https://wa.me/${phone}?text=${encodeURI(urlPrenotazione)}`;
        },
        prezzoPanuozziNutella() {
            const connteggioCommensali = [...new Set(this.commensaliList.map(cibo => cibo.username))].length;

            const conteggioPaniNutella = this.commensaliList.filter(item => item.food === 'mezzo panuozzo nutella').length;

            return (conteggioPaniNutella * 4) / connteggioCommensali;
        },
        spesaUtenteSingolo() {
            if (!this.items || !this.spesaUtente.username) return 0;

            const conteggioElementiSpesa = this.commensaliList.filter(item => item.username === this.spesaUtente.username && item.food !== 'mezzo panuozzo nutella');

            const spesaParziale = conteggioElementiSpesa.map(item => item.price).reduce((sum, x) => parseInt(sum) + parseInt(x), 0);

            return spesaParziale + parseFloat(this.prezzoPanuozziNutella);

        },
        listaUtenti() {
            return [...new Set(this.items.map(i => i.username))];
        }

    },
    watch: {
        form: {
            handler: function () {
                this.fetchData();
            },
            deep: true
        }
    }
});

window.netlifyIdentity.on("logout", () => window.location.href = "/");

setInterval(() => {
    vm.fetchData();
}, 10000);