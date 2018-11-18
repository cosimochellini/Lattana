import {Model} from "mongoose";
import * as User from "../../utils/userClass";
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
 * @returns {Promise<Array<Object>>} l'esito
 */
const getPrenotazioniCibo = async ({identity, currentUser, body, authorized, db}) => {
    try {
        if (!currentUser || !currentUser.is(User.Type.Admin)) return [];

        const [dataInizio, dataFine] = generateStartEnd(body.dataInizio, body.dataFine);

        return await db.prenotazioneCibo.find({"date": {"$gte": dataInizio, "$lt": dataFine}});

    } catch (e) {
        console.log(e);
        return [];
    }
};

export {
    getPrenotazioniCibo
};