import ServerRequests, { route } from "./ServerRequests";

function main() {
    // ServerRequests.get.user(35)
    // ServerRequests.get.songs({ genre: 'hiphop', year: 20, month: 3, day: 4}, {page: 2})
    // ServerRequests.get.songs(['hiphop', 20, 3, 4, 5], {page: 2})
    // console.log(route("songs", ["hiphop", 20, 3, 4, 5], { page: 2 }));

    ServerRequests.get.xam(() => ({
        params: { index: 35 },
    }))
}

main();
