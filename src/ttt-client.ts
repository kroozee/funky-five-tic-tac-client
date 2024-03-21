
import { lookupId } from "./clientActions";
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

playSeries('d7ac98d6-5459-4ee0-86b5-bb8ce5485034'); // X

// playSeries('49771060-35af-44b3-82be-29b8b1d0f655'); // O

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





