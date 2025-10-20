// maheshpatil369/shrinagar/Shrinagar-abcbe203037457af5cdd1912b6e3260dabf070c5/Backend/utils/ipHelper.js

// This function helps in getting the real IP address of the user,
// even if they are behind a proxy (like Nginx or a cloud load balancer).
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // 'x-forwarded-for' can be a comma-separated list of IPs. The first one is the original client.
        return forwarded.split(',').shift();
    }
    // Fallback to the direct connection's remote address.
    return req.socket.remoteAddress;
};

module.exports = { getClientIp };
