
import { createSeries, lookupId } from "./clientActions";
import { PlayerId, SeriesId, } from "./dtos";
import { getPlayer } from "./player";
import { subscribe } from "./socketSubscription";

const playSeries = (playerId: PlayerId | SeriesId) => {

    lookupId(playerId)
        .then(idLookup => {
            if (idLookup.type === 'series') {
                console.log("I can't do anything with a series id! Computers don't like to watch.");
            } else {
                console.log(idLookup);
                const player = getPlayer(playerId, idLookup.type === 'playerX' ? 'X' : 'O');
                subscribe(playerId, player.onUpdate)
            }
        });
}

playSeries('a23b85d4-6e7f-4639-85ff-1ba72da199b7'); // X

playSeries('dce1cbed-3042-464e-8126-54f096f82a02'); // O

// createSeries(100, 15, 'The Big One', 'A series of 100 games with a 15 second time control')
//     .then(sc => {
//         console.log(`Series ${sc.id} created!`);
//         console.log(`PlayerX: ${sc.playerIds.x} PlayerO: ${sc.playerIds.o}`);
//         setTimeout(() => {
//             playSeries(sc.playerIds.x);
//             playSeries(sc.playerIds.o);
//         }, 10000);
//     })
//     .catch(console.error);





