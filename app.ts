import fs from 'fs';
import path from 'path';
import { Channel } from './models/Channel';
import readline from 'readline';
import { exit, stdin, stdout } from 'process';
import validateLinks from './helpers/validate';
import filterHttpChannels from './helpers/filterByHttp';

let sortCountry = 'bt';

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

function main() {
  function startFiltering(channels: Channel[], callback?: () => any) {
    const httpChannels = filterHttpChannels(channels);
    validateLinks(httpChannels, sortCountry, channels.length, callback);
  }

  fs.readFile(path.join(__dirname, 'channels.json'), (err, data) => {
    const channels: Channel[] = JSON.parse(data.toString());

    if (sortCountry && sortCountry.toLocaleLowerCase() !== 'all') {
      let sortedChannels: Channel[] = [];
      sortedChannels = sortByCountryCode(sortCountry, channels);
      startFiltering(sortedChannels);
    } else {
      let sortedChannels: Channel[] = [...channels];
      startFiltering(sortedChannels);
    }
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
