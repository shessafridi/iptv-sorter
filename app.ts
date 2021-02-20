import fs, { readdir, writeFileSync } from 'fs';
import path from 'path';
import { Channel } from './models/Channel';
import fetch from 'node-fetch';
import m3u8stream from 'm3u8stream';

const sortCountry = 'us';

fs.readFile(path.join(__dirname, 'channels.json'), (err, data) => {
  const channels: Channel[] = JSON.parse(data.toString());
  const sortedChannels = sortByCountryCode(sortCountry, channels);
  const workingChannels: Channel[] = [];
  sortedChannels.forEach((channel, index) => {
    if (
      channel.url &&
      (channel.url.startsWith('https://') || channel.url.startsWith('http://'))
    ) {
      const stream = m3u8stream(channel.url);
      stream
        .on('data', chunk => {
          if (chunk) {
            workingChannels.push(channel);
            if (index + 1 === sortedChannels.length) {
              fs.writeFileSync(
                path.join(__dirname, 'out', `${sortCountry}-sorted.json`),
                JSON.stringify(sortedChannels, null, 2)
              );
            }
            stream.destroy();
          } else {
            setTimeout(() => {
              stream.destroy();
            }, 10000);
          }
        })
        .on('error', () => {})
        .on('close', () => {});
    }
  });

  // writeFileSync(
  //   path.join(__dirname, 'out', `${sortCountry}.json`),
  //   JSON.stringify(sortedChannels, null, 2)
  // );
});

function sortByCountryCode(countryCode: string, channels: Channel[]) {
  return channels.reduce((prev, current) => {
    if (current.countries.some(country => country.code === countryCode)) {
      prev.push(current);
    }
    return prev;
  }, [] as Channel[]);
}

// Read the number of records

// readdir(path.join(__dirname, 'out'), (err, files) => {
//   if (err) throw err;
//   const output: number[] = [];

//   files.forEach(file => {
//     console.log(path.join(__dirname, 'out', file.toString()));
//     const fileData: Channel[] = JSON.parse(
//       fs.readFileSync(path.join(__dirname, 'out', file.toString())).toString()
//     );
//     output.push(fileData.length);
//     fileData.forEach(validateUrl);
//   });

//   console.log(output);
// });

function validateUrl(channel: Channel, index: number) {
  if (channel.url) {
    fetch(channel.url)
      .then(res => {
        res.text().then(text => {
          if (res.statusText === 'OK') writeTempFile(channel.name, text, index);
        });
      })
      .catch(err => null);
  }
}

function writeTempFile(name: string, data: Buffer | string, index: number) {
  writeFileSync(path.join(__dirname, 'temp', `${name}.m3u8`), data);
}
