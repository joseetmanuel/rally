import * as fs from 'fs';
import * as path from 'path';
import { FACE_SLUGS, facePhoto, nameSlug } from './face-photo';

describe('face-photo', () => {
  it('normalizes names without accents, in lowercase and with dashes', () => {
    expect(nameSlug('Ángel César Gasca Martínez')).toBe('angel-cesar-gasca-martinez');
    expect(nameSlug('  Marco Uriel  Quintero Díaz ')).toBe('marco-uriel-quintero-diaz');
  });

  it('returns the face path for a participant with photo, whatever the accents or case', () => {
    expect(facePhoto('Silvino Martinez Soto')).toBe('assets/imgs/faces/silvino-martinez-soto.webp');
    expect(facePhoto('MARCO URIEL QUINTERO DÍAZ')).toBe('assets/imgs/faces/marco-uriel-quintero-diaz.webp');
  });

  it('returns null when there is no photo (the avatar keeps the initials)', () => {
    expect(facePhoto('Persona Sin Foto')).toBeNull();
    expect(facePhoto('')).toBeNull();
    expect(facePhoto(null)).toBeNull();
    expect(facePhoto(undefined)).toBeNull();
  });

  it('has an image file for every name on the list, and no orphan files', () => {
    const dir = path.resolve(__dirname, '../../../assets/imgs/faces');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).map((f) => f.replace('.webp', ''));
    expect([...FACE_SLUGS].sort()).toEqual(files.sort());
  });
});
