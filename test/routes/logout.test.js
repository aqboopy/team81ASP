const request = require("supertest");
const app = require("../../index");

describe("Logout Route", () => {
	it("should handle route not found with status 404", (done) => {
		request(app)
			.post("/logout") // Ensure this matches your actual route
			.expect(404) // Expecting 404 if route not found
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
