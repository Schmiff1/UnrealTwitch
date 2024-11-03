const twitch = window.Twitch.ext;

twitch.onAuthorized(function (auth) {
    // save our credentials
    if(twitch.viewer.isLinked) {
        getInfo();
    }
});

function getInfo() {
    const endpointUrl = "https://api.twitch.tv/helix/users";
    const url = `${endpointUrl}?id=${twitch.viewer.id}`;
    fetch()
}

document.getElementById('poop').addEventListener('click', (e) => {
    e.preventDefault();

    window.Twitch.ext.actions.requestIdShare();
});