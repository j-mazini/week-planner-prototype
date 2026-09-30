import { describe, it, expect } from 'vitest';
import { greet } from './greeting';

const at = (hour: number) => new Date(2026, 8, 29, hour, 30);

describe('greet', () => {
  it('greets by first name only', () => {
    expect(greet('João Silva', at(9))).toBe('Good morning, João.');
  });

  it('follows the time of day', () => {
    expect(greet('Ana', at(6))).toBe('Good morning, Ana.');
    expect(greet('Ana', at(11))).toBe('Good morning, Ana.');
    expect(greet('Ana', at(12))).toBe('Good afternoon, Ana.');
    expect(greet('Ana', at(17))).toBe('Good afternoon, Ana.');
    expect(greet('Ana', at(18))).toBe('Good evening, Ana.');
    expect(greet('Ana', at(23))).toBe('Good evening, Ana.');
  });

  it('says welcome back rather than inventing a name', () => {
    expect(greet(undefined, at(9))).toBe('Welcome back.');
    expect(greet('', at(9))).toBe('Welcome back.');
    expect(greet('   ', at(9))).toBe('Welcome back.');
  });

  it('trims a padded name', () => {
    expect(greet('  Marta Reis ', at(14))).toBe('Good afternoon, Marta.');
  });
});
