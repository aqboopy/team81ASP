const request = require("supertest");
const app = require("../../index");

describe("Register Route", () => {
	it("should register a new user and return status 200", (done) => {
		request(app)
			.post("/register")
			.send({
				username: "newuser",
				email: "newuser@example.com",
				password: "password123",
			}) // Mock registration data
			.expect(200) // Adjust to expect 200 instead of 201
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
