const app = require('../src/app');

describe('App', () => {
  describe('/address route', () => {
    it('fetches all addresses on GET /address', () => {
      return supertest(app)
        .get('/address')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.an('object');
        });
    });

    describe('POST /address', () => {
      it('should send Invalid Authorization method when Bearer token missing', () => {
        return supertest(app).post('/address').expect(400);
      });

      it('should send back error Unauthorized when auth token is incorrect', () => {
        return supertest(app).post('/address').expect(401);
      });

      it('creates a new address when fully formed', () => {
        return supertest(app)
          .post('/address')
          .send({
            firstName: 'John',
            lastName: 'Hamm',
            address1: '38 Bucket Road',
            address2: 'apt 3',
            city: 'Louisville',
            state: 'KY',
            zip: '90129',
          })
          .expect(201, 'Address created');
      });

      it('address does not require address2 field', () => {
        return supertest(app)
          .post('/address')
          .send({
            firstName: 'John',
            lastName: 'Hamm',
            address1: '38 Bucket Road',
            address2, //eslint-disable-line no-undef
            city: 'Louisville',
            state: 'KY',
            zip: '90129',
          })
          .expect(201, 'Address created');
      });

      const requiredFields = [
        'firstName',
        'lastName',
        'address1',
        'city',
        'state',
        'zip',
      ];

      const testAddress = {
        firstName: 'John',
        lastName: 'Hamm',
        address1: '38 Bucket Road',
        city: 'Louisville',
        state: 'KY',
        zip: '90129',
      };

      requiredFields.forEach((field) => {
        it(`sends back an error if required field ${field} is missing`, () => {
          testAddress[field] = '';
          return supertest(app).post('/address').send(testAddress).expect(400);
        });
      });

      it('sends back an error if the state is more than 2 characters', () => {
        const addressBadState = Object.assign(testAddress, {
          state: 'Kentucky',
        });
        return supertest(app)
          .post('/address')
          .send(addressBadState)
          .expect(400);
      });

      it('sends back an error if the zip is not exactly five digits', () => {
        const addressBadZip = Object.assign(testAddress, { zip: 54309867 });
        return supertest(app).post('/address').send(addressBadZip).expect(400);
      });
    });

    describe('DELETE /address', () => {
      it('DETELE /address/:id successfully deletes a valid id', () => {
        return supertest(app).delete('/address/:id').expect(204);
      });
    });
  });
});
