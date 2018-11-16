require('dotenv').config();

const mongoose = require('mongoose');

import immportData from "../@api/core.js"

// import reservePanuozzoToday from "../@api/controller/prenotazioni"

exports.handler = async function (event, context, callback) {

    //    const { identity, currentUser, body, parameters, authorized, db, action } = immportData(event, context);
    const data = immportData(event, context, callback);


    console.log('action', data.action);

    switch (data.action) {
        case 'reservePanuozzoToday':
            console.log('entro in reservePanuozzoToday');
            await _reservePanuozzoToday(data);
            break;
        default:
            console.log('invalid action => ', data.action);
            break;
    }

    // const prenotazioniQuery = await db.prenotazioni.find({}).exec();

    // return {
    //     statusCode: 200,
    //     body: JSON.stringify(prenotazioniQuery)
    // };

};

const _reservePanuozzoToday = async ({ identity, currentUser, body, authorized, db, callback }) => {

    // if (!currentUser.logged) {
    //     console.log('unathorized', currentUser);
    //     return "unauthorized";
    // }

    // const prenotazioniCtx = db.prenotazioni;
    // const prenotazioniCiboCtx = db.prenotazioniCibo;
    // console.log('body', JSON.parse(body));

    //console.log('typeof body', typeof body);

    let prenotazione = new db.prenotazioneCibo({
        food: body.cibo,
        username: body.username,
        email: body.email,
        date: new Date(),
        prenotazioneId: '5be1b549e7179a6bbb967c21'
    });

    // console.log(prenotazione);
    try {
        await prenotazione.save();
    } catch (ex) {
        console.log('err prenotazione.save', ex);
        callback(ex);
    }

    callback(null, {
        statusCode: 200,
        body: 'creato correttamente',
    });

};
