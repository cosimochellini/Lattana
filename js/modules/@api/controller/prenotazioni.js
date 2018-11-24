import {Model} from "mongoose";

import {generateStartEnd} from "../../utils/date";

/**
 * prenota un panuozzo per oggi, creando anche la prenotazione
 * @param {Object} param0 l'oggetto data generato da importData(...)
 * @param {Object} param0.identity
 * @param {Object<user>} param0.currentUser
 * @param {Object} param0.body
 * @param {boolean} param0.authorized
 * @param {Object} param0.db
 * @param {Model<any, {}>} param0.db.prenotazioneCibo context della tabella prenotazioneCibo
 * @param {Model<any, {}>} param0.db.prenotazioni context della tabella prenotazioni
 * @param {Function} param0.callback
 * @returns {boolean|Object} l'esito
 */
const reservePanuozzoToday = async ({identity, currentUser, body, authorized, db}) => {

    const [dataInizio, dataFine] = generateStartEnd();

    //controllo se c'è già una prenotazione di quell
    //utente per ogggi
    let prenotazione = db.prenotazioni.find({
        date: {$gte: dataInizio, $lt: dataFine},
        username: currentUser.username,
        email: currentUser.email
    });
    console.log('prenotazione già esistente : ', prenotazione);

    let prenotazioneCibo = db.prenotazioneCibo.find({
        date: {$gte: dataInizio, $lt: dataFine},
        username: currentUser.username,
        email: currentUser.email
    });
    console.log('prenotazioneCibo già esistente : ', prenotazioneCibo);


    try {
        if (!prenotazione) {
            console.log('prenotazione non trovata');
            prenotazione = new db.prenotazioni({
                username: currentUser.username,
                email: currentUser.email,
                date: new Date()
            });
            await prenotazione.save();
        }
        if (!prenotazioneCibo) {
            console.log('prenotazioneCibo non trovata');

            prenotazioneCibo = new db.prenotazioneCibo({
                food: body.cibo,
                username: currentUser.username,
                email: currentUser.email,
                date: new Date(),
                text: body.note,
                prenotazioneId: prenotazione.id
            });
            try {
                await prenotazioneCibo.save();
                return prenotazioneCibo;
            } catch (ex) {
                console.log('err prenotazioneCibo.save', ex);
                return false;
            }
        }

    } catch (e) {
        console.log('err prenotazione.save', e);
        return false;
    }

};

export {
    reservePanuozzoToday,
    getPrenotazioni
};