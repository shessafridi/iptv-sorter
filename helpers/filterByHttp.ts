import { Channel } from '../models/Channel';

function filterHttpChannels(channels: Channel[]) {
  return channels.reduce((prev, current) => {
    if (
      current.url &&
      (current.url.startsWith('https://') || current.url.startsWith('http://'))
    ) {
      prev.push(current);
    }

    return prev;
  }, [] as Channel[]);
}

export default filterHttpChannels;
