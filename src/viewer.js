const twitch = window.Twitch.ext;

twitch.onAuthorized(function (auth) {
    // save our credentials
    if(twitch.viewer.isLinked) {
        getInfo(auth);
    }
});

function getInfo(auth) {
    var UID;

    const endpointUrl = "https://api.twitch.tv/helix/users";
    const url = `${endpointUrl}?id=${twitch.viewer.id}`;
    fetch('https://unrealtwitch.onrender.com/getUserId', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${auth.token}`
        }
    })
    .then(response => response.json())
    .then(data => UID = data.userId)
    .catch(error => console.error('Error: ', error));

    console.log(UID);
}

document.getElementById('share').addEventListener('click', (e) => {
    e.preventDefault();

    window.Twitch.ext.actions.requestIdShare();
});