Vue.use(bootstrapVue);

new Vue({
    el: '#app',
    mixins: [mixin.mixin()],
    data:
        {
            user: new User(),
            form: {
                dataInizio: new Date(),
                dataFine: new Date(),
            },
            items: {
                cibo: [],
                panuozzo: [],
            },
            commensali: {
                items: [],
                form: {
                    selezione: 2
                }
            },
            selezione: 'cibo',
            fieldException: ['_id', 'prenotazioneId', '__v']
        },
    mounted() {
        if (!this.user.logged) {
            // window.location.href = "./";
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
                query: {date: {$gte: dataInizio, $lt: dataFine}},
                table: "prenotazioneCibo"
            }).then((response) => this.items.cibo = response.data);

            Api('data').post('find', {
                query: {date: {"$gte": dataInizio, "$lt": dataFine}},
                table: "prenotazioni"
            }).then((response) => this.items.panuozzo = response.data);
        },
        showCommensali() {
            this.commensali.items = _bindCommensali(this.items.cibo);

            this.$refs.modalCommensali.show()
        }
    },
    computed: {
        computedItems() {
            return this.items[this.selezione];
        },
        commensaliList() {
            let commensali = [];
            this.commensali.items.forEach(item => {
                const selezione = this.commensali.form.selezione;
                commensali.push(item);
            });
            return commensali;
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

const _bindCommensali = (items = []) => {
    let commensali = [];
    items.forEach(item => {
        const _food = window.foodGlobal.find(cibo => cibo.name === item.food);
        commensali.push({...item, ..._food});
    });
    const pani = commensali.filter(c => c.food === 'panuozzo');

    if (isOdd(pani.length)){
       const panoIndex = commensali.findIndex(c => c._id === pani[0]._id);
       commensali[panoIndex] = {...commensali[panoIndex], price : 5, only : true};
    }

        return commensali;
};

const isOdd = (number) => number % 2;
