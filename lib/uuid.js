const crypto = require("crypto");

// Random
function generateV4Id()
{
    return crypto.randomBytes(16).toString("hex");
}

const uuid = {
    generateV4Id: generateV4Id
};

module.exports = uuid;