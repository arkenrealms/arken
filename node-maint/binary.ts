export function convertToDecimal(byte) {
  let result = 0;

  byte = byte.split('');

  byte.reverse();

  for (let a = 0; a < byte.length; a++) {
    if (byte[a] === '1') {
      result += 2 ** a;
    }
  }

  return result;
}

export function binaryAgent(str) {
  let bytes = str.split(' ');
  let output = '';

  for (let k = 0; k < bytes.length; k++) {
    if (bytes[k]) output += String.fromCharCode(convertToDecimal(bytes[k]));
  }

  return output;
}

export function decodePayload(msg) {
  try {
    if (typeof msg === 'object') return msg;

    // @ts-ignore
    let json = binaryAgent(msg); //String.fromCharCode.apply(null, new Uint8Array(msg));
    // else if (Buffer.isBuffer(msg)) json = msg.toString();

    // explicitly decode the String as UTF-8 for Unicode
    //   https://github.com/mathiasbynens/utf8.js
    // json = utf8.decode(json)
    // const buffer = Buffer.from(json, "binary");
    if (typeof json === 'string') return JSON.parse(json);

    return json;
  } catch (err) {
    // ...
    console.log(err, msg);
  }
}
