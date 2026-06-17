const request = require('supertest')
const app = require('./server')

describe("Get API Endpoint", () => {
    it("should return a message", async () => {
        const res = await request(app).get("/")

        expect(res.statusCode).toEqual(200)
        expect(res.headers['content-type']).toMatch(/text\/html/)
    })
})



