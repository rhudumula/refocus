/**
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * tests/api/v1/samples/upsertWithoutPerms.js
 */
'use strict';
const supertest = require('supertest');
const api = supertest(require('../../../../express').app);
const constants = require('../../../../api/v1/constants');
const tu = require('../../../testUtils');
const u = require('./utils');
const Aspect = tu.db.Aspect;
const Subject = tu.db.Subject;
const User = tu.db.User;
const upsertPath = '/v1/samples/upsert';

describe('tests/api/v1/samples/upsertWithoutPerms.js >', () => {
  let aspect;
  let subject;
  let otherValidToken;

  before((done) => {
    tu.createToken()
    .then(() => done())
    .catch(done);
  });

  beforeEach((done) => {
    Aspect.create(u.aspectToCreate)
    .then((a) => {
      aspect = a;
      return Subject.create(u.subjectToCreate);
    })
    .then((s) => {
      subject = s;
    })
    .then(() => User.findOne({ where: { name: tu.userName } }))
    .then((usr) => aspect.addWriter(usr))
    .then(() => tu.createUser('myUNiqueUser'))
    .then((_usr) => tu.createTokenFromUserName(_usr.name))
    .then((tkn) => {
      otherValidToken = tkn;
      done();
    })
    .catch(done);
  });

  beforeEach(u.populateRedis);
  afterEach(u.forceDelete);
  after(tu.forceDeleteUser);

  it('upsert should fail when upserting a sample ' +
    'for an aspect without permission', (done) => {
    api.post(upsertPath)
    .set('Authorization', otherValidToken)
    .send({
      name: `${subject.absolutePath}|${aspect.name}`,
      value: '2',
    })
    .expect(constants.httpStatus.FORBIDDEN)
    .end(done);
  });
});
