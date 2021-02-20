import fs from 'fs';
import path from 'path';

fs.readFile(path.join(__dirname, 'channels.json'), (err, data) => {
  console.log(data.toString().substr(0, 200));
});
