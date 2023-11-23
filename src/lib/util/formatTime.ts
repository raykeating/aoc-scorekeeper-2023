// take time (in ms) and return a string in the format of "1h 1m 1s"
export default function formatTime(time: number | null) {
    if (time === null) return 'Not Started';

    const seconds = Math.floor(time / 1000) % 60;
    const minutes = Math.floor(time / 1000 / 60) % 60;
    const hours = Math.floor(time / 1000 / 60 / 60);
    return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${
        seconds ? `${seconds}s ` : ''
    }`;
}
