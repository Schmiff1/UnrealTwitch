import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import { WebSocketServer } from 'ws';

const twitch = window.Twitch.ext;
const app = express();
dotenv.config;

// setup websocket for Unreal
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port:8081 });
wss.on('connection', connection);

// get twitchAccessToken
// used to get more info on user and call twitch api
async function getAccessToken() {

    const token = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    return token.data.access_token;
}

// when Unreal connects, init get function
// allows ID to be sent when needed by Unreal
function connection(ws) {
    unrealConnection = ws

    ws.on('close', () => {
        unrealConnection = null;
    });
}

app.get('/getUserId', async (req, res) => {
    decoded = null;
    if (req.headers['authorization']) {
        let [type, auth] = req.headers['authorization'].split(' ');

        if (type == 'Bearer') {
            decoded = jwt.verify(auth, process.env.TWITCH_EXTENSION_SECRET);
            userID = decoded.user_id;
        }   
    }

    if (decoded) {
        if(unrealConnection) { unrealConnection.send(JSON.stringify({ userID })); }
        res.json({ userId });
    }
});

async function findSubscribed(UID) {
    const token = await getAccessToken();

    const sub = await axios.post('https://api.twitch.tv/helix/subscriptions', {
        params: {
            broadcaster_id: process.env.broadcaster_id,
            user_id: UID
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'Client-ID': TWITCH_CLIENT_ID
        }
    });

    if (sub.data.length() > 0) {
        if (!sub.data.is_gift) {
            return sub.data.tier;
        } else {
            return 0;
        }
    } else {
        return false;
    }
}

async function getFollowed(UID) {
    const token = await getAccessToken();

    const follow = await axios.post('https://api.twitch.tv/helix/channels/followers', {
        params: {
            user_id: UID,
            broadcaster_id: process.env.broadcaster_id
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'Client-ID': TWITCH_CLIENT_ID
        }
    });

    if (follow.data.length() > 0) {
        return true;
    } else {
        return false;
    }
}

function packData(UID, isFollowed, hasDonated, inStream, isSubbed) {
    const buf = Buffer.alloc(5);

    buf.writeUInt32LE(UID, 0)

    let flags = 0;
    if (isFollowed) flags |= 0b00000001
    if (hasDonated) flags |= 0b00000010
    if (inStream) flags |= 0b00000100
    if (isSubbed) flags |= 0b00001000
    if (giftSub) flags |= 0b00010000
    if (tier1Sub) flags |= 0b00100000
    if (tier2Sub) flags |= 0b01000000
    if (tier3Sub) flags |= 0b10000000

    buf.writeUInt8(flags, 4);
    return(buf);
}


app.listen(PORT);