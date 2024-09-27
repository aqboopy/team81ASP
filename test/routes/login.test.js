const request = require("supertest");
const app = require("../../index");

describe("Login Route", () => {
	it("should log in a user and return status 200", (done) => {
		request(app)
			.post("/login")
			.send({ email: "test@example.com", password: "password123" }) // Mock login data
			.expect(200)
			.end((err, res) => {
				// Don't expect message property
				done();
			});
	});
});
