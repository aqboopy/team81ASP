const request = require("supertest");
const app = require("../../index");

describe("Cart Route", () => {
	it("should handle redirect with status 302", (done) => {
		request(app)
			.get("/cart")
			.expect(302) // Expecting a redirect status
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
