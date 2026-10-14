import {describe,it,expect} from 'vitest';
import {studioCallback} from '../lib/studio-callback';
describe('native integration callback compatibility',()=>{
 it('normalizes the trusted legacy callback without exchanging credentials',()=>{
  expect(studioCallback('https://api.sanity.io/v1/auth/fetch?sid='+'a'.repeat(128))).toBe('/studio#sid='+'a'.repeat(128));
 });
 it.each([undefined,[], 'invalid','https://attacker.example/v1/auth/fetch?sid='+'a'.repeat(20),'https://api.sanity.io.attacker.example/v1/auth/fetch?sid='+'a'.repeat(20),'http://api.sanity.io/v1/auth/fetch?sid='+'a'.repeat(20),'https://api.sanity.io/other?sid='+'a'.repeat(20),'https://user:password@api.sanity.io/v1/auth/fetch?sid='+'a'.repeat(20),'https://api.sanity.io/v1/auth/fetch?sid=short'])('ignores untrusted or malformed callbacks (%s)',value=>{
  expect(studioCallback(value)).toBeNull();
 });
});
