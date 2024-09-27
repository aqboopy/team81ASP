const request = require("supertest");
const app = require("../../index");

describe("Report Route", function () {
	this.timeout(5000); // Increase timeout for async tests
	it("should submit a report and return status 200", (done) => {
		request(app)
			.post("/report")
			.send({ report: "Issue with product" }) // Mock report data
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
