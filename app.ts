import fs, { readdir, writeFileSync } from 'fs';
import path from 'path';
import { Channel } from './models/Channel';
import fetch from 'node-fetch';
import m3u8stream from 'm3u8stream';
import readline from 'readline';
import { exit, stdin, stdout } from 'process';

let sortCountry = 'bt';

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

function writeToFile(sortedChannels: Channel[], workingChannels: Channel[]) {
  fs.writeFileSync(
    path.join(__dirname, 'out', `${sortCountry}-sorted.json`),
    JSON.stringify(workingChannels, null, 2)
  );
  console.log(
    `Sorting Completed ${sortCountry}-sorted.json created in the out folder`
  );
  console.log(
    `${workingChannels.length} channel(s) were found working out of ${sortedChannels.length}`
  );
  exit();
}

function main() {
  fs.readFile(path.join(__dirname, 'channels.json'), (err, data) => {
    const channels: Channel[] = JSON.parse(data.toString());
    const sortedChannels = sortByCountryCode(sortCountry, channels);
    const workingChannels: Channel[] = [];
    const httpChannels = sortedChannels.reduce((prev, current) => {
      if (
        current.url &&
        (current.url.startsWith('https://') ||
          current.url.startsWith('http://'))
      ) {
        prev.push(current);
      }

      return prev;
    }, [] as Channel[]);

    let currentLink = 0;
    httpChannels.forEach((channel, index) => {
      console.log(index);
      const stream = m3u8stream(channel.url!);
      stream
        .on('data', chunk => {
          ++currentLink;

          if (chunk) {
            workingChannels.push(channel);
            if (index + 1 === httpChannels.length) {
              writeToFile(httpChannels, workingChannels);
            }
          }
          stream.destroy();
        })
        .on('error', err => {
          ++currentLink;
          console.log(`A bad link was discarded ${index}-${channel.name}`);
          if (currentLink === httpChannels.length) {
            writeToFile(httpChannels, workingChannels);
          }
        })
        .on('close', () => {
          console.log(
            `Marked as working. ${index} / ${sortedChannels.length} `
          );
          console.log(currentLink);
          if (currentLink === httpChannels.length) {
            writeToFile(httpChannels, workingChannels);
          }
        });
    });

    // writeFileSync(
    //   path.join(__dirname, 'out', `${sortCountry}.json`),
    //   JSON.stringify(sortedChannels, null, 2)
    // );
  });
}

rl.question('select a country or press x to exit: \n', answer => {
  if (answer.toLowerCase() === 'x') exit();
  sortCountry = answer;
  main();

  rl.close();
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
