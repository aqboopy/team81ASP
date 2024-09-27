const request = require("supertest");
const app = require("../../index");

describe("Retrieve Password Route", () => {
	it("should handle route not found with status 404", (done) => {
		request(app)
			.post("/retrievePassword") // Ensure this matches your actual route
			.send({ email: "test@example.com" }) // Mock email data
			.expect(404) // Expecting 404 if route not found
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
