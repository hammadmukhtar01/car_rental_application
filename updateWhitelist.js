const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const PUBLIC_KEY = process.env.MONGO_PUBLIC_KEY;
const PRIVATE_KEY = process.env.MONGO_PRIVATE_KEY;
const PROJECT_ID = process.env.MONGO_PROJECT_ID;
const BASE_URL = `https://cloud.mongodb.com/api/atlas/v2/groups/${PROJECT_ID}/accessList`;

console.log(('BASE_URL are: ', BASE_URL));

const logFile = './logfile.log';
console.log(('PUBLIC_KEY are: ', PUBLIC_KEY));
console.log(('PRIVATE_KEY are: ', PRIVATE_KEY));
console.log(('PROJECT_ID are: ', PROJECT_ID));

const log = (message) => {
  fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
};

const getCurrentIp = async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    log(`Current IP: ${response.data.ip}`);
    return response.data.ip;
  } catch (error) {
    log('Error fetching current IP: ' + error);
    throw error;
  }
};

const getWhitelist = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        'Content-Type': 'application/vnd.atlas.2023-01-01+json',
        Authorization: `Basic ${Buffer.from(
          `${PUBLIC_KEY}:${PRIVATE_KEY}`
        ).toString('base64')}`,
      },
    });
    log('Whitelist fetched');
    return response.data.results;
  } catch (error) {
    log('Error fetching whitelist ---- : ' + error);
    throw error;
  }
};

const updateWhitelist = async (ip) => {
  try {
    const whitelist = await getWhitelist();
    const isIpWhitelisted = whitelist.some((entry) => entry.ipAddress === ip);

    if (!isIpWhitelisted) {
      await axios.post(BASE_URL, [{ ipAddress: ip }], {
        headers: {
          'Content-Type': 'application/vnd.atlas.2023-01-01+json',
          Authorization: `Basic ${Buffer.from(
            `${PUBLIC_KEY}:${PRIVATE_KEY}`
          ).toString('base64')}`,
        },
      });
      log(`IP ${ip} added to whitelist.`);
    } else {
      log(`IP ${ip} is already whitelisted.`);
    }
  } catch (error) {
    log('Error updating whitelist: ' + error);
    throw error;
  }
};

const main = async () => {
  try {
    log('Script started');
    const currentIp = await getCurrentIp();
    await updateWhitelist(currentIp);
    log('Script finished');
  } catch (error) {
    log('Error in main execution: ' + error);
  }
};

main().catch((error) => log('Error in main execution catch: ' + error));
