export function calculateNetworkRate(
  currentBytes: number,
  previousBytes: number,
  currentTimestampStr: string,
  previousTimestampStr: string
): number {
  const currentTimestamp = new Date(currentTimestampStr).getTime();
  const previousTimestamp = new Date(previousTimestampStr).getTime();
  
  const elapsedSeconds = (currentTimestamp - previousTimestamp) / 1000;
  
  if (elapsedSeconds <= 0) return 0;
  
  const deltaBytes = Math.max(0, currentBytes - previousBytes);
  const bytesPerSecond = deltaBytes / elapsedSeconds;
  
  // Return Megabits per second
  return (bytesPerSecond * 8) / 1_000_000;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatRate(mbps: number) {
  if (mbps < 0.01) return '0.00 Mbps';
  return `${mbps.toFixed(2)} Mbps`;
}
