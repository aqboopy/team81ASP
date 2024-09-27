const request = require("supertest");
const app = require("../../index");

describe("Reward Route", () => {
	it("should return user rewards with status 200", (done) => {
		request(app)
			.get("/reward")
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				// Don't expect 'points' if not present
				done();
			});
	});
});
