let currentLink = 0;
import m3u8stream from '../parsers/m3parser';
import { Channel } from './../models/Channel';
import writeToFile from './cleanUp';

function validateLinks(
  channels: Channel[],
  sortCountry: string,
  total: number,
  callback?: () => any
) {
  const cleanUp = () => {
    writeToFile(channels, workingChannels, sortCountry, callback);
  };

  const workingChannels: Channel[] = [];
  channels.forEach((channel, index) => {
    try {
      let stream = m3u8stream(channel.url!);

      stream
        .on('data', chunk => {
          ++currentLink;

          if (chunk) {
            channel.active = true;
            workingChannels.push(channel);
            if (index + 1 === channels.length) {
              cleanUp();
            }
          }
          stream.destroy();
        })
        .on('error', err => {
          ++currentLink;
          console.log(`A bad link was discarded ${index}-${channel.name}`);
          stream.destroy();
          if (currentLink === channels.length) {
            cleanUp();
          }
        })
        .on('close', () => {
          console.log(`Marked as working. ${index} / ${total} `);
          console.log(currentLink);
          if (currentLink === channels.length) {
            cleanUp();
          }
        });
    } catch (e) {
      console.log('An Error occuured', e);
      if (currentLink === channels.length) {
        cleanUp();
      }
    }
  });
}

export default validateLinks;
