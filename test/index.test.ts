import { discordBuilder, } from '../src/index';

test('from', () => {
  expect(
    discordBuilder
      .from(1073325901825187841n)
      .structure
  ).toStrictEqual({
    timestamp: 1675971236426n,
    internalWorkerId: 2,
    internalProcessId: 2,
    increment: 1,
  });
});
