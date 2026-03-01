// arken/packages/node/test/api.spec.ts

import Mongoose from 'mongoose';
import { getFilter } from '../api';

describe('api/getFilter', () => {
  test('maps id equals/in/contains operators to _id consistently', () => {
    expect(
      getFilter({
        where: {
          id: { equals: 'abc' },
          AND: [{ id: { in: ['a', 'b'] } }],
          OR: [{ id: { contains: 'x.y' } }],
        },
      })
    ).toEqual({
      $and: [{ _id: 'abc' }, { _id: { $in: ['a', 'b'] } }, { $or: [{ _id: { $regex: 'x\\.y', $options: 'i' } }] }],
    });
  });

  test('ignores empty contains fragments in OR/AND clauses', () => {
    expect(
      getFilter({
        where: {
          OR: [{ name: { contains: '' } }, { email: { contains: 'abc' } }],
          AND: [{ title: { contains: '' } }],
        },
      })
    ).toEqual({
      $or: [{ email: { $regex: 'abc', $options: 'i' } }],
    });
  });

  test('supports nested OR nodes inside AND clauses', () => {
    expect(
      getFilter({
        where: {
          AND: [
            { status: { equals: 'active' } },
            { OR: [{ email: { contains: 'foo' } }, { username: { contains: 'bar' } }] },
          ],
        },
      })
    ).toEqual({
      $and: [
        { status: 'active' },
        {
          $or: [
            { email: { $regex: 'foo', $options: 'i' } },
            { username: { $regex: 'bar', $options: 'i' } },
          ],
        },
      ],
    });
  });

  test('supports scalar shorthand values as equality checks', () => {
    expect(
      getFilter({
        where: {
          id: 'abc123',
          status: 'active',
        },
      })
    ).toEqual({
      $and: [{ _id: 'abc123' }, { status: 'active' }],
    });
  });

  test('supports scalar shorthand values inside nested clauses', () => {
    expect(
      getFilter({
        where: {
          OR: [{ id: 'foo' }, { name: 'bar' }],
        },
      })
    ).toEqual({
      $or: [{ _id: 'foo' }, { name: 'bar' }],
    });
  });

  test('treats array shorthand values as $in filters', () => {
    expect(
      getFilter({
        where: {
          id: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          status: ['active', 'pending'],
        },
      })
    ).toEqual({
      $and: [
        { _id: { $in: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] } },
        { status: { $in: ['active', 'pending'] } },
      ],
    });
  });

  test('keeps non-plain objects (Date/ObjectId values) as equality conditions', () => {
    const createdAt = new Date('2026-02-18T12:34:56.000Z');
    const objectId = new Mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

    expect(
      getFilter({
        where: {
          createdAt,
          id: objectId,
        },
      })
    ).toEqual({
      $and: [{ createdAt }, { _id: objectId }],
    });
  });

  test('preserves plain-object equality filters when no operator keys are present', () => {
    expect(
      getFilter({
        where: {
          metadata: { rarity: 'legendary', flags: ['quest'] },
        },
      })
    ).toEqual({
      metadata: { rarity: 'legendary', flags: ['quest'] },
    });
  });
});
