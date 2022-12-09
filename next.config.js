const withPWABase = require('next-pwa');
const withPWA = withPWABase({dest: 'public'});

module.exports = withPWA({});
