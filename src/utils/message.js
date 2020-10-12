const generateMessage = (username,text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, location) =>{
    return {
        username,
        link: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}