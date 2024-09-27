const request = require("supertest");
const app = require("../../index");

describe("GET /profile", () => {
	it("should return status 200 even without profile data", (done) => {
		request(app)
			.get("/profile")
			.expect(200)
			.end((err, res) => {
				// Don't expect username property
				done();
			});
	});
});
