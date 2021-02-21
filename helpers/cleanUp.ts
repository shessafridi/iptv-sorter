import path from 'path';
import { exit } from 'process';
import fs from 'fs';
import { Channel } from '../models/Channel';

let useCount = 0;

function writeToFile(
  sortedChannels: Channel[],
  workingChannels: Channel[],
  sortCountry: string,
  callback: () => any = () => exit()
) {
  console.log('Writing');
  fs.writeFile(
    path.join(process.cwd(), 'out', `${sortCountry || 'all'}-sorted.json`),
    JSON.stringify(workingChannels, null, 2),
    err => {
      console.error(err);
      console.log(
        `Sorting Completed ${sortCountry}-sorted.json created in the out folder`
      );
      console.log(
        `${workingChannels.length} channel(s) were found working out of ${sortedChannels.length}`
      );
      exit();
    }
  );
}

export default writeToFile;
