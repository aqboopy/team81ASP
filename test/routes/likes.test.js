const request = require("supertest");
const app = require("../../index");

describe("Likes Route", () => {
	it("should handle redirect with status 302", (done) => {
		request(app)
			.get("/likes")
			.expect(302) // Handle redirect
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
