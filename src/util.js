import algosdk from 'algosdk';

export function abbrev(str = '') {
  return str.slice(0, 6) + '...' + str.slice(-6);
}
